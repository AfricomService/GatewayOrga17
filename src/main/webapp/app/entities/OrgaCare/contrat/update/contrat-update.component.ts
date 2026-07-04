import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IContrat, Contrat } from '../contrat.model';
import { ContratService } from '../service/contrat.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';
import { TypeContratService } from 'app/entities/OrgaCare/type-contrat/service/type-contrat.service';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneService } from 'app/entities/OrgaCare/personne/service/personne.service';

@Component({
  selector: 'jhi-contrat-update',
  templateUrl: './contrat-update.component.html',
  styleUrls: ['./contrat-update.component.scss'],
})
export class ContratUpdateComponent implements OnInit {
  isSaving = false;

  // Statuts disponibles (tabs, à la manière du rôle d'affectation)
  statusOptions = ['ACTIF', 'EXPIRE', 'PASSIF'];

  // ── État des accordéons ────────────────────────────────
  isPersonneSectionOpen = true;
  isDetailsSectionOpen = true;

  societesSharedCollection: ISociete[] = [];
  typeContratsSharedCollection: ITypeContrat[] = [];

  // ── Recherche de personne (API backend paginée) ───────
  personnesFiltered: IPersonne[] = [];
  personneSearchKeyword = '';
  personneSearchSubject = new Subject<string>();
  personnePage = 0;
  personnePageSize = 20;
  personneHasMore = true;
  personneLoadingMore = false;

  editForm = this.fb.group({
    id: [],
    dateDebut: [],
    dateFin: [],
    status: ['ACTIF'],
    societe: [],
    typeContrat: [],
    personne: [],
  });

  constructor(
    protected contratService: ContratService,
    protected societeService: SocieteService,
    protected typeContratService: TypeContratService,
    protected personneService: PersonneService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initPersonneSearch();

    this.activatedRoute.data.subscribe(({ contrat }) => {
      if (contrat.id === undefined) {
        const today = dayjs().startOf('day');
        contrat.dateDebut = today;
        contrat.dateFin = today;
      }

      this.updateForm(contrat);
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const contrat = this.createFromForm();
    if (contrat.id !== undefined) {
      this.subscribeToSaveResponse(this.contratService.update(contrat));
    } else {
      this.subscribeToSaveResponse(this.contratService.create(contrat));
    }
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  trackTypeContratById(index: number, item: ITypeContrat): number {
    return item.id!;
  }

  trackPersonneById(index: number, item: IPersonne): number {
    return item.id!;
  }

  // ── Sélection du statut ───────────────────────────────
  setStatus(status: string): void {
    this.editForm.patchValue({ status });
  }

  // ── Accordéons ─────────────────────────────────────────
  togglePersonneSection(): void {
    this.isPersonneSectionOpen = !this.isPersonneSectionOpen;
  }

  toggleDetailsSection(): void {
    this.isDetailsSectionOpen = !this.isDetailsSectionOpen;
  }

  // ── Recherche / sélection de la personne (backend) ────
  protected initPersonneSearch(): void {
    this.personneSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          this.personnePage = 0;
          this.personneHasMore = true;
          return this.fetchPersonnesPage(keyword, 0);
        })
      )
      .subscribe(personnes => {
        this.personnesFiltered = personnes;
        this.ensureSelectedPersonneVisible();
        this.cdr.markForCheck();
      });
  }

  onPersonneSearchChange(): void {
    this.personneSearchSubject.next(this.personneSearchKeyword);
  }

  loadMorePersonnes(): void {
    if (this.personneLoadingMore || !this.personneHasMore) {
      return;
    }
    this.personneLoadingMore = true;
    const nextPage = this.personnePage + 1;
    this.fetchPersonnesPage(this.personneSearchKeyword, nextPage)
      .pipe(finalize(() => (this.personneLoadingMore = false)))
      .subscribe(personnes => {
        if (personnes.length > 0) {
          this.personnePage = nextPage;
          this.personnesFiltered = [...this.personnesFiltered, ...personnes];
        } else {
          this.personneHasMore = false;
        }
      });
  }

  onPersonneListScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      this.loadMorePersonnes();
    }
  }

  protected fetchPersonnesPage(keyword: string, page: number): Observable<IPersonne[]> {
    const trimmed = keyword.trim();
    const req = { page, size: this.personnePageSize, sort: ['nomPrenom,asc'] };
    const result$ = trimmed ? this.personneService.search(trimmed, req) : this.personneService.query(req);
    return result$.pipe(map(res => res.body ?? []));
  }

  protected ensureSelectedPersonneVisible(): void {
    const current = this.editForm.get('personne')!.value as IPersonne | null;
    if (current && !this.personnesFiltered.some(p => p.id === current.id)) {
      this.personnesFiltered = [current, ...this.personnesFiltered];
    }
  }

  selectPersonne(p: IPersonne): void {
    const current = this.editForm.get('personne')!.value as IPersonne | null;
    this.editForm.patchValue({ personne: current?.id === p.id ? null : p });
  }

  isPersonneSelected(p: IPersonne): boolean {
    const current = this.editForm.get('personne')!.value as IPersonne | null;
    return current?.id === p.id;
  }

  getSelectedPersonneLabel(): string {
    const p = this.editForm.get('personne')!.value as IPersonne | null;
    return p ? p.nomPrenom ?? '#' + p.id : '';
  }

  clearSelectedPersonne(): void {
    this.editForm.patchValue({ personne: null });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IContrat>>): void {
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

  protected updateForm(contrat: IContrat): void {
    this.editForm.patchValue({
      id: contrat.id,
      dateDebut: contrat.dateDebut ? contrat.dateDebut.format(DATE_TIME_FORMAT) : null,
      dateFin: contrat.dateFin ? contrat.dateFin.format(DATE_TIME_FORMAT) : null,
      status: contrat.status ?? 'ACTIF',
      societe: contrat.societe,
      typeContrat: contrat.typeContrat,
      personne: contrat.personne,
    });

    this.societesSharedCollection = this.societeService.addSocieteToCollectionIfMissing(this.societesSharedCollection, contrat.societe);
    this.typeContratsSharedCollection = this.typeContratService.addTypeContratToCollectionIfMissing(
      this.typeContratsSharedCollection,
      contrat.typeContrat
    );
    // La liste est désormais chargée via l'API paginée/recherche (loadRelationshipsOptions).
    // On affiche juste la personne déjà sélectionnée en attendant le chargement initial.
    if (contrat.personne) {
      this.personnesFiltered = [contrat.personne];
    }
  }

  protected loadRelationshipsOptions(): void {
    this.societeService
      .query()
      .pipe(map((res: HttpResponse<ISociete[]>) => res.body ?? []))
      .pipe(
        map((societes: ISociete[]) => this.societeService.addSocieteToCollectionIfMissing(societes, this.editForm.get('societe')!.value))
      )
      .subscribe((societes: ISociete[]) => (this.societesSharedCollection = societes));

    this.typeContratService
      .query()
      .pipe(map((res: HttpResponse<ITypeContrat[]>) => res.body ?? []))
      .pipe(
        map((typeContrats: ITypeContrat[]) =>
          this.typeContratService.addTypeContratToCollectionIfMissing(typeContrats, this.editForm.get('typeContrat')!.value)
        )
      )
      .subscribe((typeContrats: ITypeContrat[]) => (this.typeContratsSharedCollection = typeContrats));

    // Chargement initial paginé (page 0) via l'API backend
    this.fetchPersonnesPage('', 0).subscribe((personnes: IPersonne[]) => {
      this.personnePage = 0;
      this.personneHasMore = personnes.length === this.personnePageSize;
      this.personnesFiltered = personnes;
      this.ensureSelectedPersonneVisible();
      this.cdr.markForCheck();
    });
  }

  protected createFromForm(): IContrat {
    return {
      ...new Contrat(),
      id: this.editForm.get(['id'])!.value,
      dateDebut: this.editForm.get(['dateDebut'])!.value ? dayjs(this.editForm.get(['dateDebut'])!.value, DATE_TIME_FORMAT) : undefined,
      dateFin: this.editForm.get(['dateFin'])!.value ? dayjs(this.editForm.get(['dateFin'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      societe: this.editForm.get(['societe'])!.value,
      typeContrat: this.editForm.get(['typeContrat'])!.value,
      personne: this.editForm.get(['personne'])!.value,
    };
  }
}
