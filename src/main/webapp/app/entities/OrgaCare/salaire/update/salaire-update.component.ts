import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISalaire, Salaire } from '../salaire.model';
import { SalaireService } from '../service/salaire.service';

@Component({
  selector: 'jhi-salaire-update',
  templateUrl: './salaire-update.component.html',
})
export class SalaireUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    valeur: [null, [Validators.required]],
    date: [],
    personneId: [],
  });

  constructor(protected salaireService: SalaireService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ salaire }) => {
      if (salaire.id === undefined) {
        const today = dayjs().startOf('day');
        salaire.date = today;
      }

      this.updateForm(salaire);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const salaire = this.createFromForm();
    if (salaire.id !== undefined) {
      this.subscribeToSaveResponse(this.salaireService.update(salaire));
    } else {
      this.subscribeToSaveResponse(this.salaireService.create(salaire));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISalaire>>): void {
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

  protected updateForm(salaire: ISalaire): void {
    this.editForm.patchValue({
      id: salaire.id,
      valeur: salaire.valeur,
      date: salaire.date ? salaire.date.format(DATE_TIME_FORMAT) : null,
      personneId: salaire.personneId,
    });
  }

  protected createFromForm(): ISalaire {
    return {
      ...new Salaire(),
      id: this.editForm.get(['id'])!.value,
      valeur: this.editForm.get(['valeur'])!.value,
      date: this.editForm.get(['date'])!.value ? dayjs(this.editForm.get(['date'])!.value, DATE_TIME_FORMAT) : undefined,
      personneId: this.editForm.get(['personneId'])!.value,
    };
  }
}
