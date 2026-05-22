import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IFormeJuridique, FormeJuridique } from '../forme-juridique.model';
import { FormeJuridiqueService } from '../service/forme-juridique.service';

@Component({
  selector: 'jhi-forme-juridique-update',
  templateUrl: './forme-juridique-update.component.html',
})
export class FormeJuridiqueUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    abreviation: [],
    nom: [],
    dateCreation: [],
    etat: [],
  });

  constructor(
    protected formeJuridiqueService: FormeJuridiqueService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ formeJuridique }) => {
      if (formeJuridique.id === undefined) {
        const today = dayjs().startOf('day');
        formeJuridique.dateCreation = today;
      }

      this.updateForm(formeJuridique);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const formeJuridique = this.createFromForm();
    if (formeJuridique.id !== undefined) {
      this.subscribeToSaveResponse(this.formeJuridiqueService.update(formeJuridique));
    } else {
      this.subscribeToSaveResponse(this.formeJuridiqueService.create(formeJuridique));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormeJuridique>>): void {
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

  protected updateForm(formeJuridique: IFormeJuridique): void {
    this.editForm.patchValue({
      id: formeJuridique.id,
      abreviation: formeJuridique.abreviation,
      nom: formeJuridique.nom,
      dateCreation: formeJuridique.dateCreation ? formeJuridique.dateCreation.format(DATE_TIME_FORMAT) : null,
      etat: formeJuridique.etat,
    });
  }

  protected createFromForm(): IFormeJuridique {
    return {
      ...new FormeJuridique(),
      id: this.editForm.get(['id'])!.value,
      abreviation: this.editForm.get(['abreviation'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      etat: this.editForm.get(['etat'])!.value,
    };
  }
}
