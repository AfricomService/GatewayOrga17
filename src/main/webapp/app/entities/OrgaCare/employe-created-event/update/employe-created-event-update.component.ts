import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IEmployeCreatedEvent, EmployeCreatedEvent } from '../employe-created-event.model';
import { EmployeCreatedEventService } from '../service/employe-created-event.service';

@Component({
  selector: 'jhi-employe-created-event-update',
  templateUrl: './employe-created-event-update.component.html',
})
export class EmployeCreatedEventUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    matricule: [],
    nomPrenom: [],
    email: [],
    userId: [],
  });

  constructor(
    protected employeCreatedEventService: EmployeCreatedEventService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ employeCreatedEvent }) => {
      this.updateForm(employeCreatedEvent);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const employeCreatedEvent = this.createFromForm();
    if (employeCreatedEvent.id !== undefined) {
      this.subscribeToSaveResponse(this.employeCreatedEventService.update(employeCreatedEvent));
    } else {
      this.subscribeToSaveResponse(this.employeCreatedEventService.create(employeCreatedEvent));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEmployeCreatedEvent>>): void {
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

  protected updateForm(employeCreatedEvent: IEmployeCreatedEvent): void {
    this.editForm.patchValue({
      id: employeCreatedEvent.id,
      matricule: employeCreatedEvent.matricule,
      nomPrenom: employeCreatedEvent.nomPrenom,
      email: employeCreatedEvent.email,
      userId: employeCreatedEvent.userId,
    });
  }

  protected createFromForm(): IEmployeCreatedEvent {
    return {
      ...new EmployeCreatedEvent(),
      id: this.editForm.get(['id'])!.value,
      matricule: this.editForm.get(['matricule'])!.value,
      nomPrenom: this.editForm.get(['nomPrenom'])!.value,
      email: this.editForm.get(['email'])!.value,
      userId: this.editForm.get(['userId'])!.value,
    };
  }
}
