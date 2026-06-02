import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPersonne } from '../personne.model';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';
import { IUser } from 'app/entities/user/user.model';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/config/pagination.constants';
import { PersonneService } from '../service/personne.service';
import { PersonneDeleteDialogComponent } from '../delete/personne-delete-dialog.component';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { TypeContratService } from 'app/entities/OrgaCare/type-contrat/service/type-contrat.service';
import { UserService } from 'app/entities/user/user.service';
import { DxDataGridComponent } from 'devextreme-angular';

type ColumnResizeMode = 'nextColumn' | 'widget';

@Component({
  selector: 'jhi-personne',
  templateUrl: './personne.component.html',
  styleUrls: ['./personne.component.scss'],
})
export class PersonneComponent implements OnInit {
  @ViewChild('dataGrid') dataGrid?: DxDataGridComponent;

  personnes?: IPersonne[];
  isLoading = false;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page?: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  matricule = '';
  nomPrenom = '';
  numTelephone = '';
  cin = '';
  typeContratId = '';
  searchField = '';
  showMoreSearch = false;

  societes: ISociete[] = [];
  users: IUser[] = [];
  typesContrat: ITypeContrat[] = [];
  selectedFile: File | null = null;
  columnResizingMode: ColumnResizeMode = 'nextColumn';
  personne!: IPersonne;

  constructor(
    protected personneService: PersonneService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected modalService: NgbModal,
    protected societeService: SocieteService,
    protected typeContratService: TypeContratService,
    protected userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.handleNavigation();
    this.loadUsers();
    this.loadSocietes();
    this.loadTypesContrat();
  }

  loadUsers(): void {
    this.userService.query().subscribe((response: HttpResponse<IUser[]>) => {
      if (response.body) {
        this.users = response.body;
      }
    });
  }

  loadSocietes(): void {
    this.societeService.query().subscribe((res: HttpResponse<ISociete[]>) => {
      this.societes = res.body ?? [];
    });
  }

  loadTypesContrat(): void {
    this.typeContratService.query().subscribe((res: HttpResponse<ITypeContrat[]>) => {
      this.typesContrat = res.body ?? [];
    });
  }

  hasAccount(personne: IPersonne): boolean {
    return personne.userId != null && personne.userId !== '';
  }

  onRowDblClick(e: { data: IPersonne }): void {
    this.router.navigate(['/personne', String(e.data.id), 'view']);
  }

  OnDeleteBtnClicked(e: { data: IPersonne }, content: unknown): void {
    this.personne = e.data;
    this.modalService.open(content, { centered: true });
  }

  confirmDelete(modal: { close: () => void }): void {
    this.personneService.delete(this.personne.id!).subscribe(() => {
      modal.close();
      this.loadPage(this.page);
    });
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
          this.cdr.detectChanges();
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          setTimeout(() => {
            if (this.dataGrid?.instance) {
              this.dataGrid.instance.refresh();
            }
          }, 0);
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        setTimeout(() => {
          if (this.dataGrid?.instance) {
            this.dataGrid.instance.refresh();
          }
        }, 0);
      },
      () => {
        this.ngbPaginationPage = 1;
      }
    );
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
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }

  protected sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? ASC : DESC)];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }
}
