import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IFonction, Fonction } from '../fonction.model';
import { FonctionService } from '../service/fonction.service';

@Component({
  selector: 'jhi-fonction-update',
  templateUrl: './fonction-update.component.html',
})
export class FonctionUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    code: [],
    label: [],
  });

  constructor(protected fonctionService: FonctionService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ fonction }) => {
      this.updateForm(fonction);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const fonction = this.createFromForm();
    if (fonction.id !== undefined) {
      this.subscribeToSaveResponse(this.fonctionService.update(fonction));
    } else {
      this.subscribeToSaveResponse(this.fonctionService.create(fonction));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFonction>>): void {
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

  protected updateForm(fonction: IFonction): void {
    this.editForm.patchValue({
      id: fonction.id,
      code: fonction.code,
      label: fonction.label,
    });
  }

  protected createFromForm(): IFonction {
    return {
      ...new Fonction(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value,
      label: this.editForm.get(['label'])!.value,
    };
  }
}
