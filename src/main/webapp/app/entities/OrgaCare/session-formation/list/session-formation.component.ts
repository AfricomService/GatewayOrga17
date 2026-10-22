import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ISessionFormation } from '../session-formation.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { SessionFormationService } from '../service/session-formation.service';
import { SessionFormationDeleteDialogComponent } from '../delete/session-formation-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';

@Component({
  selector: 'jhi-session-formation',
  templateUrl: './session-formation.component.html',
  styleUrls: ['./session-formation.component.scss'],
})
export class SessionFormationComponent implements OnInit {
  sessionFormations?: ISessionFormation[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  canEdit = false;

  // id du thème → libellé du thème
  themeLabels = new Map<number, string>();

  constructor(
    protected sessionFormationService: SessionFormationService,
    protected themeFormationService: ThemeFormationService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected accountService: AccountService
  ) {}

  loadPage(page?: number, dontNavigate?: boolean): void {
    this.isLoading = true;
    const pageToLoad: number = page ?? this.page ?? 1;

    this.sessionFormationService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<ISessionFormation[]>) => {
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
    this.loadThemes();
    this.handleNavigation();
  }

  trackId(index: number, item: ISessionFormation): number {
    return item.id!;
  }

  getThemeLabel(themeId?: number | null): string | null {
    if (themeId === null || themeId === undefined) {
      return null;
    }
    return this.themeLabels.get(themeId) ?? String(themeId);
  }

  // Clic sur la ligne → édition (ADMIN/RH) ou détail (lecture seule)
  navigateToEdit(sessionFormation: ISessionFormation): void {
    this.router.navigate(['/session-formation', sessionFormation.id, this.canEdit ? 'edit' : 'view']);
  }

  delete(sessionFormation: ISessionFormation, event: Event): void {
    event.stopPropagation();
    const modalRef = this.modalService.open(SessionFormationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.sessionFormation = sessionFormation;
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

  protected loadThemes(): void {
    this.themeFormationService.query().subscribe((res: HttpResponse<IThemeFormation[]>) => {
      (res.body ?? []).forEach(t => {
        if (t.id !== undefined) {
          this.themeLabels.set(t.id, t.theme ?? String(t.id));
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

  protected onSuccess(data: ISessionFormation[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/session-formation'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.sessionFormations = data ?? [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
