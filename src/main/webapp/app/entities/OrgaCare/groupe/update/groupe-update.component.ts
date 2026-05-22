import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IGroupe, Groupe } from '../groupe.model';
import { GroupeService } from '../service/groupe.service';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-groupe-update',
  templateUrl: './groupe-update.component.html',
})
export class GroupeUpdateComponent implements OnInit {
  isSaving = false;
  etatValues = Object.keys(Etat);

  organigrammesSharedCollection: IOrganigramme[] = [];

  editForm = this.fb.group({
    id: [],
    code: [],
    nom: [],
    dateCreation: [],
    dateActivation: [],
    etat: [null, [Validators.required]],
    organigramme: [],
  });

  constructor(
    protected groupeService: GroupeService,
    protected organigrammeService: OrganigrammeService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ groupe }) => {
      if (groupe.id === undefined) {
        const today = dayjs().startOf('day');
        groupe.dateCreation = today;
        groupe.dateActivation = today;
      }

      this.updateForm(groupe);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const groupe = this.createFromForm();
    if (groupe.id !== undefined) {
      this.subscribeToSaveResponse(this.groupeService.update(groupe));
    } else {
      this.subscribeToSaveResponse(this.groupeService.create(groupe));
    }
  }

  trackOrganigrammeById(index: number, item: IOrganigramme): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGroupe>>): void {
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

  protected updateForm(groupe: IGroupe): void {
    this.editForm.patchValue({
      id: groupe.id,
      code: groupe.code,
      nom: groupe.nom,
      dateCreation: groupe.dateCreation ? groupe.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateActivation: groupe.dateActivation ? groupe.dateActivation.format(DATE_TIME_FORMAT) : null,
      etat: groupe.etat,
      organigramme: groupe.organigramme,
    });

    this.organigrammesSharedCollection = this.organigrammeService.addOrganigrammeToCollectionIfMissing(
      this.organigrammesSharedCollection,
      groupe.organigramme
    );
  }

  protected loadRelationshipsOptions(): void {
    this.organigrammeService
      .query()
      .pipe(map((res: HttpResponse<IOrganigramme[]>) => res.body ?? []))
      .pipe(
        map((organigrammes: IOrganigramme[]) =>
          this.organigrammeService.addOrganigrammeToCollectionIfMissing(organigrammes, this.editForm.get('organigramme')!.value)
        )
      )
      .subscribe((organigrammes: IOrganigramme[]) => (this.organigrammesSharedCollection = organigrammes));
  }

  protected createFromForm(): IGroupe {
    return {
      ...new Groupe(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateActivation: this.editForm.get(['dateActivation'])!.value
        ? dayjs(this.editForm.get(['dateActivation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      etat: this.editForm.get(['etat'])!.value,
      organigramme: this.editForm.get(['organigramme'])!.value,
    };
  }
}
