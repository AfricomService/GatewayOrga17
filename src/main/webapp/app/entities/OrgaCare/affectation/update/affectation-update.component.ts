import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IAffectation, Affectation } from '../affectation.model';
import { AffectationService } from '../service/affectation.service';
import { IDepartement } from 'app/entities/OrgaCare/departement/departement.model';
import { DepartementService } from 'app/entities/OrgaCare/departement/service/departement.service';
import { IGroupe } from 'app/entities/OrgaCare/groupe/groupe.model';
import { GroupeService } from 'app/entities/OrgaCare/groupe/service/groupe.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { TypeAffectation } from 'app/entities/enumerations/type-affectation.model';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-affectation-update',
  templateUrl: './affectation-update.component.html',
})
export class AffectationUpdateComponent implements OnInit {
  isSaving = false;
  typeAffectationValues = Object.keys(TypeAffectation);
  etatValues = Object.keys(Etat);

  departementsSharedCollection: IDepartement[] = [];
  groupesSharedCollection: IGroupe[] = [];
  societesSharedCollection: ISociete[] = [];

  editForm = this.fb.group({
    id: [],
    type: [null, [Validators.required]],
    dateCreation: [],
    dateAction: [],
    dateFin: [],
    etat: [null, [Validators.required]],
    departement: [],
    groupe: [],
    societe: [],
  });

  constructor(
    protected affectationService: AffectationService,
    protected departementService: DepartementService,
    protected groupeService: GroupeService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affectation }) => {
      if (affectation.id === undefined) {
        const today = dayjs().startOf('day');
        affectation.dateCreation = today;
        affectation.dateAction = today;
        affectation.dateFin = today;
      }

      this.updateForm(affectation);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const affectation = this.createFromForm();
    if (affectation.id !== undefined) {
      this.subscribeToSaveResponse(this.affectationService.update(affectation));
    } else {
      this.subscribeToSaveResponse(this.affectationService.create(affectation));
    }
  }

  trackDepartementById(index: number, item: IDepartement): number {
    return item.id!;
  }

  trackGroupeById(index: number, item: IGroupe): number {
    return item.id!;
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAffectation>>): void {
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

  protected updateForm(affectation: IAffectation): void {
    this.editForm.patchValue({
      id: affectation.id,
      type: affectation.type,
      dateCreation: affectation.dateCreation ? affectation.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateAction: affectation.dateAction ? affectation.dateAction.format(DATE_TIME_FORMAT) : null,
      dateFin: affectation.dateFin ? affectation.dateFin.format(DATE_TIME_FORMAT) : null,
      etat: affectation.etat,
      departement: affectation.departement,
      groupe: affectation.groupe,
      societe: affectation.societe,
    });

    this.departementsSharedCollection = this.departementService.addDepartementToCollectionIfMissing(
      this.departementsSharedCollection,
      affectation.departement
    );
    this.groupesSharedCollection = this.groupeService.addGroupeToCollectionIfMissing(this.groupesSharedCollection, affectation.groupe);
    this.societesSharedCollection = this.societeService.addSocieteToCollectionIfMissing(this.societesSharedCollection, affectation.societe);
  }

  protected loadRelationshipsOptions(): void {
    this.departementService
      .query()
      .pipe(map((res: HttpResponse<IDepartement[]>) => res.body ?? []))
      .pipe(
        map((departements: IDepartement[]) =>
          this.departementService.addDepartementToCollectionIfMissing(departements, this.editForm.get('departement')!.value)
        )
      )
      .subscribe((departements: IDepartement[]) => (this.departementsSharedCollection = departements));

    this.groupeService
      .query()
      .pipe(map((res: HttpResponse<IGroupe[]>) => res.body ?? []))
      .pipe(map((groupes: IGroupe[]) => this.groupeService.addGroupeToCollectionIfMissing(groupes, this.editForm.get('groupe')!.value)))
      .subscribe((groupes: IGroupe[]) => (this.groupesSharedCollection = groupes));

    this.societeService
      .query()
      .pipe(map((res: HttpResponse<ISociete[]>) => res.body ?? []))
      .pipe(
        map((societes: ISociete[]) => this.societeService.addSocieteToCollectionIfMissing(societes, this.editForm.get('societe')!.value))
      )
      .subscribe((societes: ISociete[]) => (this.societesSharedCollection = societes));
  }

  protected createFromForm(): IAffectation {
    return {
      ...new Affectation(),
      id: this.editForm.get(['id'])!.value,
      type: this.editForm.get(['type'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateAction: this.editForm.get(['dateAction'])!.value ? dayjs(this.editForm.get(['dateAction'])!.value, DATE_TIME_FORMAT) : undefined,
      dateFin: this.editForm.get(['dateFin'])!.value ? dayjs(this.editForm.get(['dateFin'])!.value, DATE_TIME_FORMAT) : undefined,
      etat: this.editForm.get(['etat'])!.value,
      departement: this.editForm.get(['departement'])!.value,
      groupe: this.editForm.get(['groupe'])!.value,
      societe: this.editForm.get(['societe'])!.value,
    };
  }
}
