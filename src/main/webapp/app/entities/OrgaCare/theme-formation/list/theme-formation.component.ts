import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IThemeFormation } from '../theme-formation.model';
import { ThemeFormationService } from '../service/theme-formation.service';
import { ThemeFormationDeleteDialogComponent } from '../delete/theme-formation-delete-dialog.component';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-theme-formation',
  templateUrl: './theme-formation.component.html',
  styleUrls: ['./theme-formation.component.scss'],
})
export class ThemeFormationComponent implements OnInit, OnDestroy {
  themeFormations?: IThemeFormation[];
  isLoading = false;
  canEdit = false;
  searchTerm = '';
  statusFilter = '';

  protected search$ = new Subject<string>();
  protected searchSub?: Subscription;

  constructor(
    protected themeFormationService: ThemeFormationService,
    protected modalService: NgbModal,
    protected router: Router,
    protected accountService: AccountService
  ) {}

  loadAll(): void {
    this.isLoading = true;

    const term = this.searchTerm.trim();
    const req: Record<string, string> = {};
    if (term) {
      req.search = term;
    }
    if (this.statusFilter) {
      req.status = this.statusFilter;
    }

    this.themeFormationService.query(req).subscribe(
      (res: HttpResponse<IThemeFormation[]>) => {
        this.isLoading = false;
        this.themeFormations = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.searchSub = this.search$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.searchTerm = value;
      this.loadAll();
    });
    this.loadAll();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(value: string): void {
    this.search$.next(value);
  }

  onStatusChange(value: string): void {
    this.statusFilter = value;
    this.loadAll();
  }

  clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.search$.next('');
  }

  trackId(index: number, item: IThemeFormation): number {
    return item.id!;
  }

  // Clic sur la ligne → édition (ADMIN/RH) ou détail (lecture seule)
  navigateToEdit(themeFormation: IThemeFormation): void {
    this.router.navigate(['/theme-formation', themeFormation.id, this.canEdit ? 'edit' : 'view']);
  }

  delete(themeFormation: IThemeFormation, event: Event): void {
    event.stopPropagation();
    const modalRef = this.modalService.open(ThemeFormationDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.themeFormation = themeFormation;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }

  getStatusClass(status: string | undefined): string {
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
}
