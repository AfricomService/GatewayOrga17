import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IFormation, Formation } from '../formation.model';
import { FormationService } from '../service/formation.service';
import { ISessionFormation } from 'app/entities/OrgaCare/session-formation/session-formation.model';
import { SessionFormationService } from 'app/entities/OrgaCare/session-formation/service/session-formation.service';

@Component({
  selector: 'jhi-formation-update',
  templateUrl: './formation-update.component.html',
  styleUrls: ['./formation-update.component.scss'],
})
export class FormationUpdateComponent implements OnInit {
  isSaving = false;

  // Accordion : seul le premier panel est ouvert au départ
  activePanels: string[] = ['panel-0'];

  // Collection pour le select des sessions
  sessionsSharedCollection: ISessionFormation[] = [];

  editForm = this.fb.group({
    id: [],
    statut: [],
    etat: [],
    note: [],
    dateObtentionCertificat: [],
    dateExpirationCertificat: [],
    notificationEnvoyee: [],
    commentaire: [],
    sessionId: [],
    personneId: [],
  });

  constructor(
    protected formationService: FormationService,
    protected sessionFormationService: SessionFormationService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.activatedRoute.data.subscribe(({ formation }) => {
      if (formation.id === undefined) {
        const today = dayjs().startOf('day');
        formation.dateObtentionCertificat = today;
        formation.dateExpirationCertificat = today;
      }

      this.updateForm(formation);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const formation = this.createFromForm();
    if (formation.id !== undefined) {
      this.subscribeToSaveResponse(this.formationService.update(formation));
    } else {
      this.subscribeToSaveResponse(this.formationService.create(formation));
    }
  }

  trackSessionById(index: number, item: ISessionFormation): number {
    return item.id!;
  }

  protected loadSessions(): void {
    this.sessionFormationService.query().subscribe((res: HttpResponse<ISessionFormation[]>) => {
      this.sessionsSharedCollection = res.body ?? [];
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormation>>): void {
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

  protected updateForm(formation: IFormation): void {
    this.editForm.patchValue({
      id: formation.id,
      statut: formation.statut,
      etat: formation.etat,
      note: formation.note,
      dateObtentionCertificat: formation.dateObtentionCertificat ? formation.dateObtentionCertificat.format(DATE_TIME_FORMAT) : null,
      dateExpirationCertificat: formation.dateExpirationCertificat ? formation.dateExpirationCertificat.format(DATE_TIME_FORMAT) : null,
      notificationEnvoyee: formation.notificationEnvoyee,
      commentaire: formation.commentaire,
      sessionId: formation.sessionId,
      personneId: formation.personneId,
    });
  }

  protected createFromForm(): IFormation {
    return {
      ...new Formation(),
      id: this.editForm.get(['id'])!.value,
      statut: this.editForm.get(['statut'])!.value,
      etat: this.editForm.get(['etat'])!.value,
      note: this.editForm.get(['note'])!.value,
      dateObtentionCertificat: this.editForm.get(['dateObtentionCertificat'])!.value
        ? dayjs(this.editForm.get(['dateObtentionCertificat'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateExpirationCertificat: this.editForm.get(['dateExpirationCertificat'])!.value
        ? dayjs(this.editForm.get(['dateExpirationCertificat'])!.value, DATE_TIME_FORMAT)
        : undefined,
      notificationEnvoyee: this.editForm.get(['notificationEnvoyee'])!.value,
      commentaire: this.editForm.get(['commentaire'])!.value,
      sessionId: this.editForm.get(['sessionId'])!.value,
      personneId: this.editForm.get(['personneId'])!.value,
    };
  }
}
