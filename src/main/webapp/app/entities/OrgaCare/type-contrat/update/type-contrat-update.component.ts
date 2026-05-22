import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ITypeContrat, TypeContrat } from '../type-contrat.model';
import { TypeContratService } from '../service/type-contrat.service';

@Component({
  selector: 'jhi-type-contrat-update',
  templateUrl: './type-contrat-update.component.html',
})
export class TypeContratUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    nom: [],
    abreviation: [],
    dateCreation: [],
    status: [],
  });

  constructor(protected typeContratService: TypeContratService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ typeContrat }) => {
      this.updateForm(typeContrat);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const typeContrat = this.createFromForm();
    if (typeContrat.id !== undefined) {
      this.subscribeToSaveResponse(this.typeContratService.update(typeContrat));
    } else {
      this.subscribeToSaveResponse(this.typeContratService.create(typeContrat));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITypeContrat>>): void {
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

  protected updateForm(typeContrat: ITypeContrat): void {
    this.editForm.patchValue({
      id: typeContrat.id,
      nom: typeContrat.nom,
      abreviation: typeContrat.abreviation,
      dateCreation: typeContrat.dateCreation,
      status: typeContrat.status,
    });
  }

  protected createFromForm(): ITypeContrat {
    return {
      ...new TypeContrat(),
      id: this.editForm.get(['id'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      abreviation: this.editForm.get(['abreviation'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value,
      status: this.editForm.get(['status'])!.value,
    };
  }
}
