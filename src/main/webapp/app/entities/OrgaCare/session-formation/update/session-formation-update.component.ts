import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneSelectionModalComponent } from '../personne-selection-modal/personne-selection-modal.component';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISessionFormation, SessionFormation } from '../session-formation.model';
import { SessionFormationService } from '../service/session-formation.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { IFormateur } from 'app/entities/OrgaCare/formateur/formateur.model';
import { FormateurService } from 'app/entities/OrgaCare/formateur/service/formateur.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
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
  selector: 'jhi-session-formation-update',
  templateUrl: './session-formation-update.component.html',
  styleUrls: ['./session-formation-update.component.scss'],
})
export class SessionFormationUpdateComponent implements OnInit {
  isSaving = false;

  // Accordion : seul le premier panel est ouvert au départ
  activePanels: string[] = ['panel-0', 'panel-2'];

  // Collection pour le select des thèmes
  themesSharedCollection: IThemeFormation[] = [];

  // Collection pour le select des formateurs (affiche nomPrenom, enregistre l'id)
  formateursCollection: IFormateur[] = [];

  // Collection pour le select des sociétés (affiche raisonSociale, enregistre l'id)
  societesCollection: ISociete[] = [];

  // Personnes de la société sélectionnée
  personnesSociete: IPersonne[] = [];
  chefsSociete: IPersonne[] = [];
  loadingPersonnes = false;

  // Affichage des éléments sélectionnés (chips)
  selectedParticipants: IPersonne[] = [];
  selectedChefs: IPersonne[] = [];

  // Listes de valeurs fixes
  typeFormationOptions: string[] = ['Inter', 'Intra'];
  budgetOptions: string[] = ['TFP', 'Suivant réglementaire'];

  // Statut courant (lecture seule, géré par le backend)
  statut: string | null = null;

  editForm = this.fb.group({
    id: [],
    title: [],
    datePlanificationDu: [],
    datePlanificationAu: [],
    dateExecutionDu: [],
    dateExecutionAu: [],
    reglementaire: [],
    typeFormation: [],
    budget: [],
    coutSession: [],
    additionalInformations: [],
    themeId: [],
    formateurId: [],
    societeId: [],
    participantIds: [[]],
    chefProjetIds: [[]],
  });

  // ───────── Pièces jointes (upload manuel + scan PjCare) ─────────
  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  uploadingPieceJointe = false;

  // Fichiers choisis avant le 1er enregistrement (pas encore d'id de session) : envoyés après save()
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

  private currentSocieteId: number | null = null;
  private _pendingDriverFromCookie = '';

  constructor(
    protected sessionFormationService: SessionFormationService,
    protected themeFormationService: ThemeFormationService,
    protected formateurService: FormateurService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected modalService: NgbModal,
    protected pieceJointeService: PieceJointeService,
    protected pjCareService: PjCareService,
    protected scanSettingsService: ScanSettingsService,
    protected sanitizer: DomSanitizer
  ) {}

  get hasSociete(): boolean {
    return !!this.editForm.get('societeId')!.value;
  }

  get isEditMode(): boolean {
    return this.editForm.get('id')!.value != null;
  }

  get canExecute(): boolean {
    return this.isEditMode && this.statut !== 'Exécuté';
  }

  // ════════════════════════════════════════════════════════════
  //  MÉTHODES PUBLIQUES
  // ════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.loadThemes();
    this.loadFormateurs();
    this.loadSocietes();
    // Changement de société par l'utilisateur → on vide les sélections et on recharge
    this.editForm.get('societeId')!.valueChanges.subscribe((id: number | null) => this.onSocieteChanged(id));
    this.activatedRoute.data.subscribe(({ sessionFormation }) => {
      if (sessionFormation.id === undefined) {
        const today = dayjs().startOf('day');
        sessionFormation.datePlanificationDu = today;
        sessionFormation.datePlanificationAu = today;
        sessionFormation.dateExecutionDu = today;
        sessionFormation.dateExecutionAu = today;
      }

      this.updateForm(sessionFormation);
    });
  }

  previousState(): void {
    window.history.back();
  }

  executer(): void {
    this.save(true);
  }

  save(executer = false): void {
    this.isSaving = true;
    const sessionFormation = this.createFromForm();
    const save$ =
      sessionFormation.id != null
        ? this.sessionFormationService.update(sessionFormation)
        : this.sessionFormationService.create(sessionFormation);

    save$
      .pipe(
        switchMap((res: HttpResponse<ISessionFormation>) => {
          const sessionId = res.body!.id!;
          return forkJoin([
            this.sessionFormationService.saveParticipants(sessionId, this.editForm.get('participantIds')!.value ?? []),
            this.sessionFormationService.saveChefs(sessionId, this.editForm.get('chefProjetIds')!.value ?? []),
            // Pièces jointes choisies avant le 1er enregistrement (n'échoue jamais : erreurs gérées dedans)
            this.uploadPendingPieceJointes(sessionId),
          ]).pipe(
            switchMap(() => (executer ? this.sessionFormationService.executer(sessionId) : of(null))),
            // Les formations ne sont générées qu'à l'exécution (ou si la session est déjà exécutée)
            switchMap(() =>
              executer || this.statut === 'Exécuté' ? this.sessionFormationService.syncFormations(sessionId) : of(undefined)
            )
          );
        }),
        finalize(() => this.onSaveFinalize())
      )
      .subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
      );
  }

  trackPersonneById(index: number, item: IPersonne): number {
    return item.id!;
  }

  trackThemeById(index: number, item: IThemeFormation): number {
    return item.id!;
  }

  trackFormateurById(index: number, item: IFormateur): number {
    return item.id!;
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  // ───────── Sélection (modal) ─────────
  openParticipantsModal(): void {
    this.openSelectionModal('Sélectionner les participants', this.personnesSociete, 'participantIds');
  }

  openChefsModal(): void {
    this.openSelectionModal('Sélectionner les chefs de projet', this.chefsSociete, 'chefProjetIds');
  }

  removeParticipant(id: number): void {
    this.removeId('participantIds', id);
  }

  removeChef(id: number): void {
    this.removeId('chefProjetIds', id);
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
        name: 'session-formation',
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

  // ════════════════════════════════════════════════════════════
  //  MÉTHODES PROTECTED
  // ════════════════════════════════════════════════════════════

  // ───────── Société → personnes ─────────
  protected onSocieteChanged(societeId: number | null): void {
    if (societeId === this.currentSocieteId) {
      return;
    }
    this.currentSocieteId = societeId;
    this.editForm.patchValue({ participantIds: [], chefProjetIds: [] }, { emitEvent: false });
    this.refreshSelection();
    this.loadPersonnesOfSociete(societeId);
  }

  protected loadPersonnesOfSociete(societeId: number | null): void {
    this.personnesSociete = [];
    this.chefsSociete = [];
    if (!societeId) {
      this.refreshSelection();
      return;
    }
    this.loadingPersonnes = true;
    forkJoin([
      this.sessionFormationService.findPersonnesBySociete(societeId),
      this.sessionFormationService.findPersonnesBySociete(societeId, 'CHEF'),
    ])
      .pipe(finalize(() => (this.loadingPersonnes = false)))
      .subscribe(([personnes, chefs]) => {
        this.personnesSociete = personnes;
        this.chefsSociete = chefs;
        this.refreshSelection();
      });
  }

  protected openSelectionModal(title: string, personnes: IPersonne[], controlName: 'participantIds' | 'chefProjetIds'): void {
    const modalRef = this.modalService.open(PersonneSelectionModalComponent, { size: 'lg', backdrop: 'static', scrollable: true });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.personnes = personnes;
    modalRef.componentInstance.selectedIds = this.editForm.get(controlName)!.value ?? [];
    modalRef.result.then(
      (ids: number[]) => {
        this.editForm.get(controlName)!.setValue(ids);
        this.refreshSelection();
      },
      () => {
        // modal fermée sans validation
      }
    );
  }

  protected removeId(controlName: 'participantIds' | 'chefProjetIds', id: number): void {
    const ids: number[] = this.editForm.get(controlName)!.value ?? [];
    this.editForm.get(controlName)!.setValue(ids.filter(i => i !== id));
    this.refreshSelection();
  }

  protected refreshSelection(): void {
    const toPersonnes = (ids: number[], source: IPersonne[]): IPersonne[] =>
      ids.map(id => source.find(p => p.id === id) ?? ({ id, nomPrenom: `#${id}` } as IPersonne));
    this.selectedParticipants = toPersonnes(this.editForm.get('participantIds')!.value ?? [], this.personnesSociete);
    this.selectedChefs = toPersonnes(this.editForm.get('chefProjetIds')!.value ?? [], this.chefsSociete);
  }

  protected loadThemes(): void {
    this.themeFormationService.query().subscribe((res: HttpResponse<IThemeFormation[]>) => {
      this.themesSharedCollection = res.body ?? [];
    });
  }

  protected loadFormateurs(): void {
    // size élevé : l'API des formateurs est paginée (20 par défaut)
    this.formateurService.query({ size: 1000, sort: ['nomPrenom,asc'] }).subscribe((res: HttpResponse<IFormateur[]>) => {
      this.formateursCollection = res.body ?? [];
    });
  }

  protected loadSocietes(): void {
    // size élevé : l'API des sociétés est paginée (20 par défaut)
    this.societeService.query({ size: 1000, sort: ['raisonSociale,asc'] }).subscribe((res: HttpResponse<ISociete[]>) => {
      this.societesCollection = res.body ?? [];
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISessionFormation>>): void {
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

  protected updateForm(sessionFormation: ISessionFormation): void {
    this.editForm.patchValue({
      id: sessionFormation.id,
      title: sessionFormation.title,
      datePlanificationDu: sessionFormation.datePlanificationDu ? sessionFormation.datePlanificationDu.format(DATE_TIME_FORMAT) : null,
      datePlanificationAu: sessionFormation.datePlanificationAu ? sessionFormation.datePlanificationAu.format(DATE_TIME_FORMAT) : null,
      dateExecutionDu: sessionFormation.dateExecutionDu ? sessionFormation.dateExecutionDu.format(DATE_TIME_FORMAT) : null,
      dateExecutionAu: sessionFormation.dateExecutionAu ? sessionFormation.dateExecutionAu.format(DATE_TIME_FORMAT) : null,
      reglementaire: sessionFormation.reglementaire,
      typeFormation: sessionFormation.typeFormation ?? null,
      budget: sessionFormation.budget ?? null,
      coutSession: sessionFormation.coutSession,
      additionalInformations: sessionFormation.additionalInformations,
      themeId: sessionFormation.themeId ?? null,
      formateurId: sessionFormation.formateurId ?? null,
      societeId: sessionFormation.societeId ?? null,
    });

    this.statut = sessionFormation.statut ?? null;

    // Chargement des personnes de la société + des sélections existantes (mode édition)
    this.currentSocieteId = sessionFormation.societeId ?? null;
    this.loadPersonnesOfSociete(this.currentSocieteId);

    if (sessionFormation.id != null) {
      this.loadPieceJointes(sessionFormation.id);
      forkJoin([
        this.sessionFormationService.getParticipantIds(sessionFormation.id),
        this.sessionFormationService.getChefIds(sessionFormation.id),
      ]).subscribe(([participantIds, chefIds]) => {
        this.editForm.patchValue({ participantIds, chefProjetIds: chefIds }, { emitEvent: false });
        this.refreshSelection();
      });
    }
  }

  protected createFromForm(): ISessionFormation {
    return {
      ...new SessionFormation(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      datePlanificationDu: this.editForm.get(['datePlanificationDu'])!.value
        ? dayjs(this.editForm.get(['datePlanificationDu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      datePlanificationAu: this.editForm.get(['datePlanificationAu'])!.value
        ? dayjs(this.editForm.get(['datePlanificationAu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateExecutionDu: this.editForm.get(['dateExecutionDu'])!.value
        ? dayjs(this.editForm.get(['dateExecutionDu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateExecutionAu: this.editForm.get(['dateExecutionAu'])!.value
        ? dayjs(this.editForm.get(['dateExecutionAu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      reglementaire: this.editForm.get(['reglementaire'])!.value,
      typeFormation: this.editForm.get(['typeFormation'])!.value,
      budget: this.editForm.get(['budget'])!.value,
      coutSession: this.editForm.get(['coutSession'])!.value,
      additionalInformations: this.editForm.get(['additionalInformations'])!.value,
      themeId: this.editForm.get(['themeId'])!.value,
      formateurId: this.editForm.get(['formateurId'])!.value,
      societeId: this.editForm.get(['societeId'])!.value,
    };
  }

  // ───────── Pièces jointes (protected) ─────────
  protected loadPieceJointes(sessionId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findBySession(sessionId).subscribe({
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
   * Envoie les PJ en attente. Ne remonte jamais d'erreur (la session est déjà enregistrée) :
   * on prévient simplement l'utilisateur si certains envois ont échoué.
   */
  protected uploadPendingPieceJointes(sessionId: number): Observable<unknown> {
    if (this.pendingPieceJointes.length === 0) {
      return of(null);
    }

    const uploads = this.pendingPieceJointes.map(p =>
      this.pieceJointeService.uploadForSession(p.file, sessionId).pipe(catchError(() => of(null)))
    );

    return forkJoin(uploads).pipe(
      tap(results => {
        this.pendingPieceJointes = [];
        if (results.some(r => r === null)) {
          alert(
            "La session est enregistrée, mais certaines pièces jointes n'ont pas pu être envoyées. Rouvrez la session pour les ajouter à nouveau."
          );
        }
      })
    );
  }

  // ════════════════════════════════════════════════════════════
  //  MÉTHODES PRIVATE
  // ════════════════════════════════════════════════════════════
  private generateRandomId(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private uploadFile(file: File): void {
    const sessionId = this.editForm.get('id')!.value as number | null;

    // Session pas encore enregistrée : on met le fichier de côté, il sera envoyé après le 1er save()
    if (sessionId == null) {
      this.stagePendingPieceJointe(file);
      return;
    }

    this.uploadingPieceJointe = true;
    this.pieceJointeService.uploadForSession(file, sessionId).subscribe({
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

  // ───────── PJ en attente (mode création) ─────────
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
