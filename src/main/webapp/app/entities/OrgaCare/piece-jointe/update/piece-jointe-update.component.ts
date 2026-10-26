import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IPieceJointe, PieceJointe } from '../piece-jointe.model';
import { PieceJointeService } from '../service/piece-jointe.service';

@Component({
  selector: 'jhi-piece-jointe-update',
  templateUrl: './piece-jointe-update.component.html',
})
export class PieceJointeUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    nomFichier: [],
    type: [],
    fichierURL: [],
    dateUpload: [],
    formateurId: [],
    sessionId: [],
    formationId: [],
  });

  constructor(protected pieceJointeService: PieceJointeService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceJointe }) => {
      if (pieceJointe.id === undefined) {
        const today = dayjs().startOf('day');
        pieceJointe.dateUpload = today;
      }

      this.updateForm(pieceJointe);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pieceJointe = this.createFromForm();
    if (pieceJointe.id !== undefined) {
      this.subscribeToSaveResponse(this.pieceJointeService.update(pieceJointe));
    } else {
      this.subscribeToSaveResponse(this.pieceJointeService.create(pieceJointe));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPieceJointe>>): void {
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

  protected updateForm(pieceJointe: IPieceJointe): void {
    this.editForm.patchValue({
      id: pieceJointe.id,
      nomFichier: pieceJointe.nomFichier,
      type: pieceJointe.type,
      fichierURL: pieceJointe.fichierURL,
      dateUpload: pieceJointe.dateUpload ? pieceJointe.dateUpload.format(DATE_TIME_FORMAT) : null,
      formateurId: pieceJointe.formateurId,
      sessionId: pieceJointe.sessionId,
      formationId: pieceJointe.formationId,
    });
  }

  protected createFromForm(): IPieceJointe {
    return {
      ...new PieceJointe(),
      id: this.editForm.get(['id'])!.value,
      nomFichier: this.editForm.get(['nomFichier'])!.value,
      type: this.editForm.get(['type'])!.value,
      fichierURL: this.editForm.get(['fichierURL'])!.value,
      dateUpload: this.editForm.get(['dateUpload'])!.value ? dayjs(this.editForm.get(['dateUpload'])!.value, DATE_TIME_FORMAT) : undefined,
      formateurId: this.editForm.get(['formateurId'])!.value,
      sessionId: this.editForm.get(['sessionId'])!.value,
      formationId: this.editForm.get(['formationId'])!.value,
    };
  }
}
