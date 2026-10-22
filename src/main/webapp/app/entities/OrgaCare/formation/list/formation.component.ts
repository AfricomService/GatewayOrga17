import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormation } from '../formation.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { FormationService } from '../service/formation.service';
import { FormationDeleteDialogComponent } from '../delete/formation-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { ISessionFormation } from 'app/entities/OrgaCare/session-formation/session-formation.model';
import { SessionFormationService } from 'app/entities/OrgaCare/session-formation/service/session-formation.service';

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

  // id de la session → titre de la session
  sessionLabels = new Map<number, string>();

  constructor(
    protected formationService: FormationService,
    protected sessionFormationService: SessionFormationService,
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

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.loadSessions();
    this.handleNavigation();
  }

  trackId(index: number, item: IFormation): number {
    return item.id!;
  }

  getSessionLabel(sessionId?: number | null): string | null {
    if (sessionId === null || sessionId === undefined) {
      return null;
    }
    return this.sessionLabels.get(sessionId) ?? String(sessionId);
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

  protected loadSessions(): void {
    this.sessionFormationService.query().subscribe((res: HttpResponse<ISessionFormation[]>) => {
      (res.body ?? []).forEach(s => {
        if (s.id !== undefined) {
          this.sessionLabels.set(s.id, s.title ?? String(s.id));
        }
      });
    });
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
}
