import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IStatusHistory, StatusHistory } from '../status-history.model';
import { StatusHistoryService } from '../service/status-history.service';

@Component({
  selector: 'jhi-status-history-update',
  templateUrl: './status-history-update.component.html',
})
export class StatusHistoryUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    dateTransaction: [],
    dateFin: [],
    loginUser: [],
    transaction: [],
    transactionReference: [],
    dataObject: [],
  });

  constructor(protected statusHistoryService: StatusHistoryService, protected activatedRoute: ActivatedRoute, protected fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ statusHistory }) => {
      if (statusHistory.id === undefined) {
        const today = dayjs().startOf('day');
        statusHistory.dateTransaction = today;
        statusHistory.dateFin = today;
      }

      this.updateForm(statusHistory);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const statusHistory = this.createFromForm();
    if (statusHistory.id !== undefined) {
      this.subscribeToSaveResponse(this.statusHistoryService.update(statusHistory));
    } else {
      this.subscribeToSaveResponse(this.statusHistoryService.create(statusHistory));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IStatusHistory>>): void {
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

  protected updateForm(statusHistory: IStatusHistory): void {
    this.editForm.patchValue({
      id: statusHistory.id,
      dateTransaction: statusHistory.dateTransaction ? statusHistory.dateTransaction.format(DATE_TIME_FORMAT) : null,
      dateFin: statusHistory.dateFin ? statusHistory.dateFin.format(DATE_TIME_FORMAT) : null,
      loginUser: statusHistory.loginUser,
      transaction: statusHistory.transaction,
      transactionReference: statusHistory.transactionReference,
      dataObject: statusHistory.dataObject,
    });
  }

  protected createFromForm(): IStatusHistory {
    return {
      ...new StatusHistory(),
      id: this.editForm.get(['id'])!.value,
      dateTransaction: this.editForm.get(['dateTransaction'])!.value
        ? dayjs(this.editForm.get(['dateTransaction'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateFin: this.editForm.get(['dateFin'])!.value ? dayjs(this.editForm.get(['dateFin'])!.value, DATE_TIME_FORMAT) : undefined,
      loginUser: this.editForm.get(['loginUser'])!.value,
      transaction: this.editForm.get(['transaction'])!.value,
      transactionReference: this.editForm.get(['transactionReference'])!.value,
      dataObject: this.editForm.get(['dataObject'])!.value,
    };
  }
}
