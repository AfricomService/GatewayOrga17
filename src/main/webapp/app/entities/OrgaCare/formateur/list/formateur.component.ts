import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormateur } from '../formateur.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { FormateurService } from '../service/formateur.service';
import { FormateurDeleteDialogComponent } from '../delete/formateur-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';

@Component({
  selector: 'jhi-formateur',
  templateUrl: './formateur.component.html',
  styleUrls: ['./formateur.component.scss'],
})
export class FormateurComponent implements OnInit, OnDestroy {
  formateurs?: IFormateur[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  canEdit = false;
  searchTerm = '';
  statusFilter = '';

  // id du thème → libellé du thème
  themeLabels = new Map<number, string>();

  protected search$ = new Subject<string>();
  protected searchSub?: Subscription;

  constructor(
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

    const req: Record<string, string | number | string[]> = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.sort(),
    };
    const term = this.searchTerm.trim();
    if (term) {
      req.search = term;
    }
    if (this.statusFilter) {
      req.status = this.statusFilter;
    }

    this.formateurService.query(req).subscribe(
      (res: HttpResponse<IFormateur[]>) => {
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
    this.searchSub = this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.searchTerm = value;
      this.loadPage(1);
    });
    this.loadThemes();
    this.handleNavigation();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(value: string): void {
    this.search$.next(value);
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.search$.next('');
  }

  onStatusChange(value: string): void {
    this.statusFilter = value;
    this.loadPage(1);
  }

  trackId(index: number, item: IFormateur): number {
    return item.id!;
  }

  getThemeLabel(themeId?: number | null): string | null {
    if (themeId === null || themeId === undefined) {
      return null;
    }
    return this.themeLabels.get(themeId) ?? String(themeId);
  }

  // Clic sur la ligne → édition (ADMIN/RH) ou détail (lecture seule)
  navigateToEdit(formateur: IFormateur): void {
    this.router.navigate(['/formateur', formateur.id, this.canEdit ? 'edit' : 'view']);
  }

  delete(formateur: IFormateur, event: Event): void {
    event.stopPropagation();
    const modalRef = this.modalService.open(FormateurDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.formateur = formateur;
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

  protected onSuccess(data: IFormateur[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/formateur'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? ASC : DESC),
        },
      });
    }
    this.formateurs = data ?? [];
    this.ngbPaginationPage = this.page;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
