import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, forkJoin } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormation } from '../formation.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { FormationService } from '../service/formation.service';
import { FormationDeleteDialogComponent } from '../delete/formation-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { ISessionFormation } from 'app/entities/OrgaCare/session-formation/session-formation.model';
import { SessionFormationService } from 'app/entities/OrgaCare/session-formation/service/session-formation.service';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { FormateurService } from 'app/entities/OrgaCare/formateur/service/formateur.service';

@Component({
  selector: 'jhi-formation',
  templateUrl: './formation.component.html',
  styleUrls: ['./formation.component.scss'],
})
export class FormationComponent implements OnInit {
  formations?: IFormation[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  canEdit = false;

  // Filtres de recherche
  keyword = '';
  selectedPersonneId: number | null = null;
  selectedFormateurId: number | null = null;
  beneficiaireOptions: { id: number; name: string }[] = [];
  formateurOptions: { id: number; name: string }[] = [];

  // Tables de correspondance id → valeur
  sessionsById = new Map<number, ISessionFormation>();
  formateurNames = new Map<number, string>();
  themeNames = new Map<number, string>();
  personneNames = new Map<number, string>();

  constructor(
    protected formationService: FormationService,
    protected sessionFormationService: SessionFormationService,
    protected formateurService: FormateurService,
    protected themeFormationService: ThemeFormationService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected accountService: AccountService
  ) {}

  loadPage(page?: number, dontNavigate?: boolean): void {
    this.isLoading = true;
    const pageToLoad: number = page ?? this.page ?? 1;

    this.formationService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        ...this.buildFilters(),
      })
      .subscribe(
        (res: HttpResponse<IFormation[]>) => {
          this.isLoading = false;
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate);
        },
        () => {
          this.isLoading = false;
          this.onError();
        }
      );
  }

  search(): void {
    this.loadPage(1);
  }

  resetFilters(): void {
    this.keyword = '';
    this.selectedPersonneId = null;
    this.selectedFormateurId = null;
    this.loadPage(1);
  }

  get hasFilters(): boolean {
    return this.keyword.trim() !== '' || this.selectedPersonneId !== null || this.selectedFormateurId !== null;
  }

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.loadReferences();
    this.handleNavigation();
  }

  trackId(index: number, item: IFormation): number {
    return item.id!;
  }

  getSession(formation: IFormation): ISessionFormation | undefined {
    return formation.sessionId != null ? this.sessionsById.get(formation.sessionId) : undefined;
  }

  getTitle(formation: IFormation): string | null {
    const session = this.getSession(formation);
    if (session) {
      return session.title ?? null;
    }
    return formation.sessionId != null ? String(formation.sessionId) : null;
  }

  getFormateur(formation: IFormation): string | null {
    const id = this.getSession(formation)?.formateurId;
    return id != null ? this.formateurNames.get(id) ?? null : null;
  }

  getTheme(formation: IFormation): string | null {
    const id = this.getSession(formation)?.themeId;
    return id != null ? this.themeNames.get(id) ?? null : null;
  }

  getBeneficiaire(formation: IFormation): string | null {
    const id = formation.personneId;
    return id != null ? this.personneNames.get(id) ?? `#${id}` : null;
  }

  // Clic sur la ligne → édition (ADMIN/RH) ou détail (lecture seule)
  navigateToEdit(formation: IFormation): void {
    this.router.navigate(['/formation', formation.id, this.canEdit ? 'edit' : 'view']);
  }

  delete(formation: IFormation, event: Event): void {
    event.stopPropagation();
    const modalRef = this.modalService.open(FormationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.formation = formation;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadPage();
      }
    });
  }

  getStatusClass(status: string | undefined | null): string {
    switch (status) {
      case 'Exécuté':
      case 'ACTIF':
        return 'badge-actif';
      case 'DRAFT':
        return 'badge-draft';
      case 'CANCELED':
        return 'badge-canceled';
      case 'CLOSED':
        return 'badge-closed';
      case 'INEXECUTION':
        return 'badge-inexecution';
      default:
        return 'badge-default';
    }
  }

  protected loadReferences(): void {
    // size élevé : ces API sont paginées (20 par défaut)
    this.sessionFormationService.query({ size: 1000 }).subscribe(res => {
      (res.body ?? []).forEach(s => {
        if (s.id !== undefined) {
          this.sessionsById.set(s.id, s);
        }
      });
    });

    this.formateurService.query({ size: 1000, sort: ['nomPrenom,asc'] }).subscribe(res => {
      (res.body ?? []).forEach(f => {
        if (f.id !== undefined) {
          this.formateurNames.set(f.id, f.nomPrenom ?? String(f.id));
        }
      });
      this.formateurOptions = Array.from(this.formateurNames.entries()).map(([id, name]) => ({ id, name }));
    });

    this.themeFormationService.query({ size: 1000 }).subscribe(res => {
      (res.body ?? []).forEach(t => {
        if (t.id !== undefined) {
          this.themeNames.set(t.id, t.theme ?? String(t.id));
        }
      });
    });

    forkJoin([this.sessionFormationService.findAllPersonnes(), this.formationService.findBeneficiaireIds()]).subscribe(
      ([personnes, beneficiaireIds]) => {
        personnes.forEach(p => {
          if (p.id !== undefined) {
            this.personneNames.set(p.id, p.nomPrenom ?? p.matricule ?? String(p.id));
          }
        });
        // La liste de recherche ne contient que les personnes qui ont une formation
        this.beneficiaireOptions = beneficiaireIds
          .map(id => ({ id, name: this.personneNames.get(id) ?? `#${id}` }))
          .sort((a, b) => a.name.localeCompare(b.name));
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

  protected onSuccess(data: IFormation[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/formation'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.formations = data ?? [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }

  protected buildFilters(): { [key: string]: any } {
    const filters: { [key: string]: any } = {};
    if (this.keyword.trim() !== '') {
      filters.keyword = this.keyword.trim();
    }
    if (this.selectedPersonneId !== null) {
      filters.personneId = this.selectedPersonneId;
    }
    if (this.selectedFormateurId !== null) {
      filters.formateurId = this.selectedFormateurId;
    }
    return filters;
  }
}
