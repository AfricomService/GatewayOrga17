import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IPersonne } from '../personne.model';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { PersonneService } from '../service/personne.service';
import { PersonneDeleteDialogComponent } from '../delete/personne-delete-dialog.component';
import { TypeContratService } from 'app/entities/OrgaCare/type-contrat/service/type-contrat.service';
import { FrontendConfigService } from '../service/frontend-config.service';
import { AccountService } from 'app/core/auth/account.service';
import { SalaireService, ISalaireImportResult } from 'app/entities/OrgaCare/salaire/service/salaire.service';

@Component({
  selector: 'jhi-personne',
  templateUrl: './personne.component.html',
  styleUrls: ['./personne.component.scss'],
})
export class PersonneComponent implements OnInit {
  personnes?: IPersonne[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  // Recherche
  matricule = '';
  nomPrenom = '';
  numTelephone = '';
  cin = '';
  typeContratId = '';
  searchField = '';
  showMoreSearch = false;

  typesContrat: ITypeContrat[] = [];
  selectedFile: File | null = null;

  keycloakAdminUrl?: string;
  canEdit = false;

  // Import en masse des salaires
  salaireFile: File | null = null;
  isImportingSalaire = false;
  isDownloadingTemplate = false;
  salaireImportResult: ISalaireImportResult | null = null;
  salaireImportError: string | null = null;

  private importSalaireModalRef?: NgbModalRef;

  constructor(
    protected personneService: PersonneService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected typeContratService: TypeContratService,
    protected frontendConfigService: FrontendConfigService,
    protected accountService: AccountService,
    protected salaireService: SalaireService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.handleNavigation();
    this.loadTypesContrat();
    if (this.canEdit) {
      this.loadKeycloakConfig();
    }
  }

  loadTypesContrat(): void {
    this.typeContratService.query().subscribe((res: HttpResponse<ITypeContrat[]>) => {
      this.typesContrat = res.body ?? [];
    });
  }

  loadKeycloakConfig(): void {
    this.frontendConfigService.getKeycloakConfig().subscribe({
      next: cfg => {
        this.keycloakAdminUrl = cfg.adminUserCreateUrl;
        this.cdr.detectChanges();
      },
      error: () => {
        this.keycloakAdminUrl = undefined;
      },
    });
  }

  openKeycloakCreateUser(): void {
    if (!this.keycloakAdminUrl) {
      return;
    }
    window.open(this.keycloakAdminUrl, '_blank');
  }

  hasAccount(personne: IPersonne): boolean {
    return personne.userId != null && personne.userId !== '';
  }

  // Click → edit page (ADMIN/RH) or detail page (read-only)
  editPersonne(personne: IPersonne): void {
    this.router.navigate(['/personne', personne.id, this.canEdit ? 'edit' : 'view']);
  }

  delete(personne: IPersonne): void {
    const modalRef = this.modalService.open(PersonneDeleteDialogComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.personne = personne;
    modalRef.closed.subscribe((reason: string) => {
      if (reason === 'deleted') {
        this.loadPage();
      }
    });
  }

  // ── Import en masse des salaires ─────────────────────
  openImportSalaireModal(content: unknown): void {
    this.salaireFile = null;
    this.salaireImportResult = null;
    this.salaireImportError = null;
    this.importSalaireModalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  downloadSalaireTemplate(): void {
    this.isDownloadingTemplate = true;
    this.salaireImportError = null;
    this.salaireService.downloadImportTemplate().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modele_salaires.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.isDownloadingTemplate = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDownloadingTemplate = false;
        this.salaireImportError = 'Erreur lors du téléchargement du modèle.';
        this.cdr.detectChanges();
      },
    });
  }

  onSalaireFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.salaireImportResult = null;
    this.salaireImportError = null;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        this.salaireFile = null;
        this.salaireImportError = 'Format invalide : veuillez choisir un fichier .xlsx.';
      } else {
        this.salaireFile = file;
      }
      input.value = ''; // permet de re-sélectionner le même fichier après correction
    }
  }

  importSalaires(): void {
    if (!this.salaireFile) {
      return;
    }
    this.isImportingSalaire = true;
    this.salaireImportResult = null;
    this.salaireImportError = null;

    this.salaireService.importFromExcel(this.salaireFile).subscribe({
      next: (res: ISalaireImportResult) => {
        this.isImportingSalaire = false;
        this.salaireImportResult = res;
        this.salaireFile = null;
        this.cdr.detectChanges();
      },
      error: err => {
        this.isImportingSalaire = false;
        this.salaireImportError = err?.error?.message ?? err?.error?.title ?? "Erreur lors de l'import des salaires.";
        this.cdr.detectChanges();
      },
    });
  }

  closeImportSalaireModal(): void {
    this.importSalaireModalRef?.close();
  }

  trackId(_index: number, item: IPersonne): number {
    return item.id!;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.importExcel();
    }
  }

  importExcel(): void {
    if (!this.selectedFile) {
      return;
    }
    this.personneService.importFromExcel(this.selectedFile).subscribe(
      (imported: IPersonne[]) => {
        if (imported.length > 0) {
          this.personnes = imported;
        }
      },
      () => {
        /* erreur gérée silencieusement */
      }
    );
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    this.isLoading = true;
    const pageToLoad: number = page ?? this.page ?? 1;

    this.personneService
      .query(
        { page: pageToLoad - 1, size: this.itemsPerPage, sort: this.sort() },
        {
          matricule: this.matricule || undefined,
          nomPrenom: this.nomPrenom || undefined,
          numTelephone: this.numTelephone || undefined,
          cin: this.cin || undefined,
          typeContratId: this.typeContratId || undefined,
        }
      )
      .subscribe(
        (res: HttpResponse<IPersonne[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate);
        },
        () => {
          this.isLoading = false;
          this.onError();
        }
      );
  }

  search1(): void {
    this.page = 1;
    this.personneService.search(this.searchField, { page: 0, size: this.itemsPerPage, sort: this.sort() }).subscribe(
      (res: HttpResponse<IPersonne[]>) => {
        this.totalItems = Number(res.headers.get('X-Total-Count'));
        this.page = 1;
        this.ngbPaginationPage = 1;
        this.personnes = res.body ?? [];
        this.cdr.detectChanges();
      },
      () => {
        this.ngbPaginationPage = 1;
      }
    );
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected handleNavigation(): void {
    combineLatest([this.activatedRoute.data, this.activatedRoute.queryParamMap]).subscribe(([data, params]) => {
      const page = params.get('page');
      const pageNumber = +(page ?? 1);
      const sort = (params.get(SORT) ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === ASC;
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
        this.loadPage(pageNumber, true);
      }
    });
  }

  protected onSuccess(data: IPersonne[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/personne'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.personnes = data ?? [];
    this.ngbPaginationPage = this.page;
    this.cdr.detectChanges();
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
