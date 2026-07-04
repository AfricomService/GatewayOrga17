import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

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

  societesSharedCollection: ISociete[] = [];
  typeContratsSharedCollection: ITypeContrat[] = [];

  // ── Recherche de personne ─────────────────────────────
  personnesSharedCollection: IPersonne[] = [];
  personnesFiltered: IPersonne[] = [];
  personneSearchKeyword = '';

  editForm = this.fb.group({
    id: [],
    dateDebut: [],
    dateFin: [],
    type: [],
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

  // ── Recherche / sélection de la personne ──────────────
  filterPersonnes(): void {
    const kw = this.personneSearchKeyword.toLowerCase().trim();
    this.personnesFiltered = kw
      ? this.personnesSharedCollection.filter(
          p => (p.nomPrenom ?? '').toLowerCase().includes(kw) || (p.matricule ?? '').toLowerCase().includes(kw)
        )
      : [...this.personnesSharedCollection];
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
      type: contrat.type,
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
    this.personnesSharedCollection = this.personneService.addPersonneToCollectionIfMissing(
      this.personnesSharedCollection,
      contrat.personne
    );
    this.personnesFiltered = [...this.personnesSharedCollection];
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

    this.personneService
      .query()
      .pipe(map((res: HttpResponse<IPersonne[]>) => res.body ?? []))
      .pipe(
        map((personnes: IPersonne[]) =>
          this.personneService.addPersonneToCollectionIfMissing(personnes, this.editForm.get('personne')!.value)
        )
      )
      .subscribe((personnes: IPersonne[]) => {
        this.personnesSharedCollection = personnes;
        this.filterPersonnes();
        this.cdr.markForCheck();
      });
  }

  protected createFromForm(): IContrat {
    return {
      ...new Contrat(),
      id: this.editForm.get(['id'])!.value,
      dateDebut: this.editForm.get(['dateDebut'])!.value ? dayjs(this.editForm.get(['dateDebut'])!.value, DATE_TIME_FORMAT) : undefined,
      dateFin: this.editForm.get(['dateFin'])!.value ? dayjs(this.editForm.get(['dateFin'])!.value, DATE_TIME_FORMAT) : undefined,
      type: this.editForm.get(['type'])!.value,
      status: this.editForm.get(['status'])!.value,
      societe: this.editForm.get(['societe'])!.value,
      typeContrat: this.editForm.get(['typeContrat'])!.value,
      personne: this.editForm.get(['personne'])!.value,
    };
  }
}
