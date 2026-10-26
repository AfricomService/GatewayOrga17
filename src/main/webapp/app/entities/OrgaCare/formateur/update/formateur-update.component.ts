import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from 'file-saver';
import * as dayjs from 'dayjs';

import { IFormateur, Formateur } from '../formateur.model';
import { FormateurService } from '../service/formateur.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { Etat } from 'app/entities/enumerations/etat.model';
import { IPieceJointe } from 'app/entities/OrgaCare/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/OrgaCare/piece-jointe/service/piece-jointe.service';
import { PjCareService, PjCareDriverInfo, ScanDriver, ScannedPage } from 'app/entities/OrgaCare/piece-jointe/service/pjcare.service';
import { ScanSettingsService } from 'app/entities/OrgaCare/piece-jointe/service/scan-settings.service';

interface PendingPieceJointe {
  tempId: string;
  file: File;
  displayName: string;
  extension: string;
}

@Component({
  selector: 'jhi-formateur-update',
  templateUrl: './formateur-update.component.html',
  styleUrls: ['./formateur-update.component.scss'],
})
export class FormateurUpdateComponent implements OnInit {
  isSaving = false;

  // Valeurs autorisées pour le champ statut du formateur (seulement 2)
  statusOptions: { value: string; label: string }[] = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
  ];

  // Liste des thèmes pour le select
  themesCollection: IThemeFormation[] = [];

  // Accordion
  sectionIdentite = true;
  sectionFormation = true;
  sectionPj = true;

  editForm = this.fb.group({
    id: [],
    nomPrenom: [null, [Validators.required]],
    cin: [],
    email: [null, [Validators.email]],
    telephone: [],
    status: [Etat.ACTIF],
    comments: [],
    themeId: [null],
  });

  // ───────── Pièces jointes (upload manuel + scan PjCare) ─────────
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  uploadingPieceJointe = false;

  // Fichiers choisis avant le 1er enregistrement (pas encore d'id) : envoyés après save()
  pendingPieceJointes: PendingPieceJointe[] = [];

  // Aperçu inline
  selectedPjForPreview: IPieceJointe | null = null;

  // Renommage
  showRenamePjModal = false;
  pjToRename: IPieceJointe | null = null;
  renamePjNewName = '';
  renamePjError = '';
  isRenamingPj = false;

  // Scan PjCare
  pjcareAvailable = false;
  scanners: string[] = [];
  selectedScanner = '';
  scanFormat: 'jpg' | 'png' | 'pdf' | 'tiff' = 'pdf';
  scanDpi = 150;
  scanQuality = 75;
  scanBitdepth: 'color' | 'gray' | 'bw' = 'color';
  scanDuplex = false;
  isScanning = false;
  isMerging = false;
  scanPreview: string | null = null;
  scanError: string | null = null;
  loadingScanners = false;
  availableDrivers: PjCareDriverInfo[] = [];
  selectedDriver: ScanDriver | '' = '';
  loadingDrivers = false;
  scanExcludeBlank = false;
  scanBlankThreshold = 240;
  scanCoverageThreshold = 5;
  currentDocumentPages: ScannedPage[] = [];

  scanAccordionStates: { [key: string]: boolean } = {
    scanSource: true,
    scanParams: true,
  };

  private _pendingDriverFromCookie = '';

  constructor(
    protected formateurService: FormateurService,
    protected themeFormationService: ThemeFormationService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected modalService: NgbModal,
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ formateur }) => {
      this.updateForm(formateur);
      this.loadThemes();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const formateur = this.createFromForm();
    const save$ = formateur.id !== undefined ? this.formateurService.update(formateur) : this.formateurService.create(formateur);

    save$
      .pipe(
        // PJ choisies avant le 1er enregistrement (n'échoue jamais : erreurs gérées dedans)
        switchMap((res: HttpResponse<IFormateur>) => this.uploadPendingPieceJointes(res.body!.id!)),
        finalize(() => this.onSaveFinalize())
      )
      .subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
      );
  }

  trackThemeById(index: number, item: IThemeFormation): number {
    return item.id!;
  }

  // Aide template : champ invalide et touché
  hasError(controlName: string, error?: string): boolean {
    const control = this.editForm.get(controlName);
    if (!control || !(control.dirty || control.touched)) {
      return false;
    }
    return error ? !!control.errors?.[error] : control.invalid;
  }

  // ───────── Pièces jointes ─────────
  trackPjById(index: number, item: IPieceJointe): number {
    return item.id!;
  }

  pjFullName(pj: IPieceJointe): string {
    return `${pj.nomFichier ?? ''}${pj.type ? '.' + pj.type : ''}`;
  }

  removePieceJointe(id: number): void {
    this.pieceJointeService.delete(id).subscribe({
      next: () => {
        this.pieceJointes = this.pieceJointes.filter(pj => pj.id !== id);
        if (this.selectedPjForPreview?.id === id) {
          this.selectedPjForPreview = null;
        }
      },
      error: () => alert('Échec de la suppression de la pièce jointe'),
    });
  }

  downloadPieceJointe(pj: IPieceJointe): void {
    this.pieceJointeService.getFile(pj.id!).subscribe({
      next: (blob: Blob) => saveAs(blob, this.pjFullName(pj)),
      error(err) {
        console.error('Download failed', err);
        alert('Échec du téléchargement du fichier');
      },
    });
  }

  // ───────── Renommer ─────────
  openRenamePjModal(pj: IPieceJointe): void {
    this.pjToRename = pj;
    this.renamePjNewName = pj.nomFichier ?? '';
    this.renamePjError = '';
    this.showRenamePjModal = true;
  }

  closeRenamePjModal(): void {
    if (this.isRenamingPj) {
      return;
    }
    this.showRenamePjModal = false;
    this.pjToRename = null;
    this.renamePjNewName = '';
    this.renamePjError = '';
  }

  confirmRenamePj(): void {
    const target = this.pjToRename;
    if (!target) {
      return;
    }

    const trimmed = (this.renamePjNewName || '').trim();
    if (!trimmed) {
      this.renamePjError = 'Le nom ne peut pas être vide';
      return;
    }

    this.isRenamingPj = true;
    this.renamePjError = '';

    this.pieceJointeService.rename(target.id!, trimmed).subscribe({
      next: () => {
        this.isRenamingPj = false;
        this.pieceJointes = this.pieceJointes.map(p => (p.id === target.id ? { ...p, nomFichier: trimmed } : p));
        if (this.selectedPjForPreview?.id === target.id) {
          this.selectedPjForPreview = { ...this.selectedPjForPreview, nomFichier: trimmed };
        }
        this.closeRenamePjModal();
      },
      error: err => {
        this.isRenamingPj = false;
        console.error('Erreur renommage PJ', err);
        this.renamePjError = 'Erreur lors du renommage';
      },
    });
  }

  // ───────── Aperçu inline ─────────
  togglePjPreview(pj: IPieceJointe): void {
    this.selectedPjForPreview = this.selectedPjForPreview?.id === pj.id ? null : pj;
  }

  closePjPreview(): void {
    this.selectedPjForPreview = null;
  }

  // ───────── Upload manuel ─────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.uploadFile(file);
    input.value = '';
  }

  removePendingPieceJointe(tempId: string): void {
    this.pendingPieceJointes = this.pendingPieceJointes.filter(p => p.tempId !== tempId);
  }

  // ───────── Scan PjCare ─────────
  openScanModal(content: TemplateRef<unknown>): void {
    this.scanPreview = null;
    this.scanError = null;
    this.isMerging = false;
    this.currentDocumentPages = [];

    const hasSavedSettings = this.scanSettingsService.hasSettings();
    this.scanAccordionStates['scanSource'] = !hasSavedSettings;
    this.scanAccordionStates['scanParams'] = !hasSavedSettings;

    this.loadScanSettings();
    this.checkPjCare();
    this.modalService.open(content, { size: 'lg', windowClass: 'scan-modal-window' });
  }

  saveScanSettings(): void {
    this.scanSettingsService.save({
      scanFormat: this.scanFormat,
      scanDpi: this.scanDpi,
      scanQuality: this.scanQuality,
      scanBitdepth: this.scanBitdepth,
      scanDuplex: this.scanDuplex,
      scanExcludeBlank: this.scanExcludeBlank,
      scanBlankThreshold: this.scanBlankThreshold,
      scanCoverageThreshold: this.scanCoverageThreshold,
      selectedDriver: this.selectedDriver as string,
    });
  }

  resetScanSettings(): void {
    this.scanSettingsService.reset();
    this.scanFormat = 'pdf';
    this.scanDpi = 150;
    this.scanQuality = 75;
    this.scanBitdepth = 'color';
    this.scanDuplex = false;
    this.scanExcludeBlank = false;
    this.scanBlankThreshold = 240;
    this.scanCoverageThreshold = 5;
  }

  checkPjCare(): void {
    this.loadingScanners = true;
    this.loadingDrivers = true;

    this.pjCareService.getHealth().subscribe({
      next: res => {
        if (res && res.status === 200) {
          this.pjcareAvailable = true;
          this.pjCareService.getDrivers().subscribe({
            next: driverRes => {
              this.availableDrivers = driverRes.drivers;
              const defaultKey = res.defaultDriver || (this.availableDrivers[0]?.key ?? '');

              const cookieDriver = this._pendingDriverFromCookie;
              const cookieDriverExists = cookieDriver ? this.availableDrivers.some(d => d.key === cookieDriver) : false;

              this.selectedDriver = (cookieDriverExists ? cookieDriver : defaultKey) as ScanDriver;
              this._pendingDriverFromCookie = '';
              this.loadingDrivers = false;
              this.loadScannersForDriver(this.selectedDriver);
            },
            error: () => {
              this.availableDrivers = [];
              this.loadingDrivers = false;
              this.loadScannersForDriver(undefined);
            },
          });
        } else {
          this.pjcareAvailable = false;
          this.loadingScanners = false;
          this.loadingDrivers = false;
        }
      },
      error: () => {
        this.pjcareAvailable = false;
        this.loadingScanners = false;
        this.loadingDrivers = false;
      },
    });
  }

  loadScannersForDriver(driver?: ScanDriver): void {
    this.loadingScanners = true;
    this.scanners = [];
    this.selectedScanner = '';

    this.pjCareService.getScanners(driver).subscribe({
      next: scanRes => {
        this.scanners = scanRes.scanners;
        if (this.scanners.length > 0) {
          this.selectedScanner = this.scanners[0];
        }
        this.loadingScanners = false;
      },
      error: () => {
        this.scanners = [];
        this.loadingScanners = false;
      },
    });
  }

  onDriverChange(): void {
    this.scanPreview = null;
    this.scanError = null;
    this.loadScannersForDriver(this.selectedDriver || undefined);
  }

  launchScan(): void {
    this.isScanning = true;
    this.scanError = null;
    this.scanPreview = null;

    this.saveScanSettings();

    this.pjCareService
      .scan({
        source: this.selectedScanner,
        driver: this.selectedDriver || undefined,
        format: this.scanFormat,
        dpi: this.scanDpi,
        jpegquality: this.scanQuality,
        bitdepth: this.scanBitdepth,
        duplex: this.scanDuplex,
        name: 'formateur',
        excludeBlank: this.scanExcludeBlank,
        blankThreshold: this.scanBlankThreshold,
        coverageThreshold: this.scanCoverageThreshold,
      })
      .subscribe({
        next: result => {
          this.isScanning = false;
          if (result.status === 200) {
            const preview = this.scanFormat !== 'pdf' ? `data:image/${this.scanFormat};base64,${result.data}` : null;
            this.scanPreview = preview ?? 'pdf';

            const page: ScannedPage = {
              data: result.data,
              format: result.format || this.scanFormat,
              preview,
              pageNumber: this.currentDocumentPages.length + 1,
            };
            this.currentDocumentPages.push(page);
          } else {
            this.scanError = result.error ?? 'Erreur inconnue';
          }
        },
        error: () => {
          this.isScanning = false;
          this.scanError = 'PjCare inaccessible. Vérifiez que le service tourne.';
        },
      });
  }

  removePage(index: number): void {
    this.currentDocumentPages.splice(index, 1);
    this.currentDocumentPages.forEach((p, i) => (p.pageNumber = i + 1));
    if (this.currentDocumentPages.length === 0) {
      this.scanPreview = null;
    }
  }

  attachScanResult(modal: any): void {
    if (this.currentDocumentPages.length === 0) {
      return;
    }

    // Session non enregistrée : _attachRawResult() → uploadFile() met le scan en attente

    if (this.currentDocumentPages.length === 1) {
      const p = this.currentDocumentPages[0];
      this._attachRawResult(p.data, this.scanFormat, modal);
      return;
    }

    this.isMerging = true;
    this.scanError = null;

    this.pjCareService
      .mergePages({
        pages: this.currentDocumentPages.map(p => ({ data: p.data, format: p.format })),
        outputFormat: this.scanFormat,
        jpegquality: this.scanQuality,
        name: 'session-formation',
      })
      .subscribe({
        next: result => {
          this.isMerging = false;
          if (result.status === 200) {
            this._attachRawResult(result.data, result.format, modal);
          } else {
            this.scanError = result.error ?? 'Erreur lors de la fusion des pages';
          }
        },
        error: () => {
          this.isMerging = false;
          this.scanError = 'Erreur lors de la fusion des pages';
        },
      });
  }

  protected loadThemes(): void {
    this.themeFormationService.query().subscribe((res: HttpResponse<IThemeFormation[]>) => {
      this.themesCollection = res.body ?? [];
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormateur>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(formateur: IFormateur): void {
    this.editForm.patchValue({
      id: formateur.id,
      nomPrenom: formateur.nomPrenom,
      cin: formateur.cin,
      email: formateur.email,
      telephone: formateur.telephone,
      status: formateur.status ?? Etat.ACTIF,
      comments: formateur.comments,
      themeId: formateur.themeId ?? null,
    });

    if (formateur.id != null) {
      this.loadPieceJointes(formateur.id);
    }
  }

  protected createFromForm(): IFormateur {
    return {
      ...new Formateur(),
      id: this.editForm.get(['id'])!.value,
      nomPrenom: this.editForm.get(['nomPrenom'])!.value,
      cin: this.editForm.get(['cin'])!.value,
      email: this.editForm.get(['email'])!.value,
      telephone: this.editForm.get(['telephone'])!.value,
      status: this.editForm.get(['status'])!.value ?? Etat.ACTIF,
      comments: this.editForm.get(['comments'])!.value,
      themeId: this.editForm.get(['themeId'])!.value,
    };
  }

  // ───────── Pièces jointes (protected) ─────────
  protected loadPieceJointes(formateurId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByFormateur(formateurId).subscribe({
      next: pjs => {
        this.pieceJointes = pjs;
        this.loadingPieceJointes = false;
      },
      error: () => {
        this.pieceJointes = [];
        this.loadingPieceJointes = false;
      },
    });
  }

  /**
   * Envoie les PJ en attente. Ne remonte jamais d'erreur (le formateur est déjà enregistré) :
   * on prévient simplement l'utilisateur si certains envois ont échoué.
   */
  protected uploadPendingPieceJointes(formateurId: number): Observable<unknown> {
    if (this.pendingPieceJointes.length === 0) {
      return of(null);
    }

    const uploads = this.pendingPieceJointes.map(p =>
      this.pieceJointeService.uploadForFormateur(p.file, formateurId).pipe(catchError(() => of(null)))
    );

    return forkJoin(uploads).pipe(
      tap(results => {
        this.pendingPieceJointes = [];
        if (results.some(r => r === null)) {
          alert(
            "Le formateur est enregistré, mais certaines pièces jointes n'ont pas pu être envoyées. Rouvrez la fiche pour les ajouter à nouveau."
          );
        }
      })
    );
  }

  // ───────── Méthodes privées ─────────
  private generateRandomId(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private uploadFile(file: File): void {
    const formateurId = this.editForm.get('id')!.value as number | null;

    // Formateur pas encore enregistré : on met le fichier de côté, il sera envoyé après le 1er save()
    if (formateurId == null) {
      this.stagePendingPieceJointe(file);
      return;
    }

    this.uploadingPieceJointe = true;
    this.pieceJointeService.uploadForFormateur(file, formateurId).subscribe({
      next: pj => {
        this.pieceJointes = [pj, ...this.pieceJointes];
        this.uploadingPieceJointe = false;
      },
      error: () => {
        this.uploadingPieceJointe = false;
        alert('Échec du téléchargement du fichier');
      },
    });
  }

  private stagePendingPieceJointe(file: File): void {
    const lastDot = file.name.lastIndexOf('.');
    const displayName = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
    const extension = lastDot > 0 ? file.name.substring(lastDot + 1) : '';

    this.pendingPieceJointes = [{ tempId: this.generateRandomId(10), file, displayName, extension }, ...this.pendingPieceJointes];
  }

  private loadScanSettings(): void {
    const s = this.scanSettingsService.load();
    this.scanFormat = s.scanFormat;
    this.scanDpi = s.scanDpi;
    this.scanQuality = s.scanQuality;
    this.scanBitdepth = s.scanBitdepth;
    this.scanDuplex = s.scanDuplex;
    this.scanExcludeBlank = s.scanExcludeBlank;
    this.scanBlankThreshold = s.scanBlankThreshold;
    this.scanCoverageThreshold = s.scanCoverageThreshold;
    this._pendingDriverFromCookie = s.selectedDriver;
  }

  private _attachRawResult(base64: string, format: string, modal: any): void {
    const mimeType = format === 'pdf' ? 'application/pdf' : `image/${format}`;
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const filename = `scan-${dayjs().format('YYYYMMDD-HHmmss')}.${format}`;
    const file = new File([blob], filename, { type: mimeType });

    this.uploadFile(file);

    this.currentDocumentPages = [];
    this.scanPreview = null;
    modal.close();
  }
}
