import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IAbsence, Absence } from '../absence.model';
import { AbsenceService } from '../service/absence.service';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneService } from 'app/entities/OrgaCare/personne/service/personne.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-absence-update',
  templateUrl: './absence-update.component.html',
})
export class AbsenceUpdateComponent implements OnInit {
  isSaving = false;
  etatValues = Object.keys(Etat);

  personnesSharedCollection: IPersonne[] = [];

  editForm = this.fb.group({
    id: [],
    dateCreation: [],
    etat: [null, [Validators.required]],
    dateDebut: [],
    dateFin: [],
    motif: [],
    personneAbscent: [],
    personneRemplacant: [],
  });

  constructor(
    protected absenceService: AbsenceService,
    protected personneService: PersonneService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ absence }) => {
      if (absence.id === undefined) {
        const today = dayjs().startOf('day');
        absence.dateCreation = today;
        absence.dateDebut = today;
        absence.dateFin = today;
      }

      this.updateForm(absence);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const absence = this.createFromForm();
    if (absence.id !== undefined) {
      this.subscribeToSaveResponse(this.absenceService.update(absence));
    } else {
      this.subscribeToSaveResponse(this.absenceService.create(absence));
    }
  }

  trackPersonneById(index: number, item: IPersonne): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAbsence>>): void {
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

  protected updateForm(absence: IAbsence): void {
    this.editForm.patchValue({
      id: absence.id,
      dateCreation: absence.dateCreation ? absence.dateCreation.format(DATE_TIME_FORMAT) : null,
      etat: absence.etat,
      dateDebut: absence.dateDebut ? absence.dateDebut.format(DATE_TIME_FORMAT) : null,
      dateFin: absence.dateFin ? absence.dateFin.format(DATE_TIME_FORMAT) : null,
      motif: absence.motif,
      personneAbscent: absence.personneAbscent,
      personneRemplacant: absence.personneRemplacant,
    });

    this.personnesSharedCollection = this.personneService.addPersonneToCollectionIfMissing(
      this.personnesSharedCollection,
      absence.personneAbscent,
      absence.personneRemplacant
    );
  }

  protected loadRelationshipsOptions(): void {
    this.personneService
      .query()
      .pipe(map((res: HttpResponse<IPersonne[]>) => res.body ?? []))
      .pipe(
        map((personnes: IPersonne[]) =>
          this.personneService.addPersonneToCollectionIfMissing(
            personnes,
            this.editForm.get('personneAbscent')!.value,
            this.editForm.get('personneRemplacant')!.value
          )
        )
      )
      .subscribe((personnes: IPersonne[]) => (this.personnesSharedCollection = personnes));
  }

  protected createFromForm(): IAbsence {
    return {
      ...new Absence(),
      id: this.editForm.get(['id'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      etat: this.editForm.get(['etat'])!.value,
      dateDebut: this.editForm.get(['dateDebut'])!.value ? dayjs(this.editForm.get(['dateDebut'])!.value, DATE_TIME_FORMAT) : undefined,
      dateFin: this.editForm.get(['dateFin'])!.value ? dayjs(this.editForm.get(['dateFin'])!.value, DATE_TIME_FORMAT) : undefined,
      motif: this.editForm.get(['motif'])!.value,
      personneAbscent: this.editForm.get(['personneAbscent'])!.value,
      personneRemplacant: this.editForm.get(['personneRemplacant'])!.value,
    };
  }
}
