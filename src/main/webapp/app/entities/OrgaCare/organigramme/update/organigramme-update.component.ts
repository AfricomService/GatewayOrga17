import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IOrganigramme, Organigramme } from '../organigramme.model';
import { OrganigrammeService } from '../service/organigramme.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-organigramme-update',
  templateUrl: './organigramme-update.component.html',
})
export class OrganigrammeUpdateComponent implements OnInit {
  isSaving = false;
  etatValues = Object.keys(Etat);

  societesSharedCollection: ISociete[] = [];

  editForm = this.fb.group({
    id: [],
    code: [],
    nom: [],
    dateCreation: [],
    dateAction: [],
    dateExpiration: [],
    etat: [null, [Validators.required]],
    societe: [],
  });

  constructor(
    protected organigrammeService: OrganigrammeService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organigramme }) => {
      if (organigramme.id === undefined) {
        const today = dayjs().startOf('day');
        organigramme.dateCreation = today;
        organigramme.dateAction = today;
        organigramme.dateExpiration = today;
      }

      this.updateForm(organigramme);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const organigramme = this.createFromForm();
    if (organigramme.id !== undefined) {
      this.subscribeToSaveResponse(this.organigrammeService.update(organigramme));
    } else {
      this.subscribeToSaveResponse(this.organigrammeService.create(organigramme));
    }
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOrganigramme>>): void {
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

  protected updateForm(organigramme: IOrganigramme): void {
    this.editForm.patchValue({
      id: organigramme.id,
      code: organigramme.code,
      nom: organigramme.nom,
      dateCreation: organigramme.dateCreation ? organigramme.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateAction: organigramme.dateAction ? organigramme.dateAction.format(DATE_TIME_FORMAT) : null,
      dateExpiration: organigramme.dateExpiration ? organigramme.dateExpiration.format(DATE_TIME_FORMAT) : null,
      etat: organigramme.etat,
      societe: organigramme.societe,
    });

    this.societesSharedCollection = this.societeService.addSocieteToCollectionIfMissing(
      this.societesSharedCollection,
      organigramme.societe
    );
  }

  protected loadRelationshipsOptions(): void {
    this.societeService
      .query()
      .pipe(map((res: HttpResponse<ISociete[]>) => res.body ?? []))
      .pipe(
        map((societes: ISociete[]) => this.societeService.addSocieteToCollectionIfMissing(societes, this.editForm.get('societe')!.value))
      )
      .subscribe((societes: ISociete[]) => (this.societesSharedCollection = societes));
  }

  protected createFromForm(): IOrganigramme {
    return {
      ...new Organigramme(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateAction: this.editForm.get(['dateAction'])!.value ? dayjs(this.editForm.get(['dateAction'])!.value, DATE_TIME_FORMAT) : undefined,
      dateExpiration: this.editForm.get(['dateExpiration'])!.value
        ? dayjs(this.editForm.get(['dateExpiration'])!.value, DATE_TIME_FORMAT)
        : undefined,
      etat: this.editForm.get(['etat'])!.value,
      societe: this.editForm.get(['societe'])!.value,
    };
  }
}
