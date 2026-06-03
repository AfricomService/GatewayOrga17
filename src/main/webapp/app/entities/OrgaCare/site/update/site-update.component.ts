import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISite, Site } from '../site.model';
import { SiteService } from '../service/site.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-site-update',
  templateUrl: './site-update.component.html',
  styleUrls: ['./site-update.component.scss'],
})
export class SiteUpdateComponent implements OnInit {
  isSaving = false;
  etatValues = Object.keys(Etat);

  // Accordion section states — Section Générale is open by default
  sectionGenerale = true;
  sectionAdresse = false;
  sectionCommunication = false;

  societesSharedCollection: ISociete[] = [];

  editForm = this.fb.group({
    id: [],
    code: [],
    nom: [],
    etat: [null, [Validators.required]],
    adresse: [],
    codePostale: [],
    ville: [],
    tel: [],
    fax: [],
    email: [],
    dateCreation: [],
    dateActivation: [],
    dateCloture: [],
    societe: [],
  });

  constructor(
    protected siteService: SiteService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ site }) => {
      if (site.id === undefined) {
        const today = dayjs().startOf('day');
        site.dateCreation = today;
        site.dateActivation = today;
        site.dateCloture = today;
      }

      this.updateForm(site);
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const site = this.createFromForm();
    if (site.id !== undefined) {
      this.subscribeToSaveResponse(this.siteService.update(site));
    } else {
      this.subscribeToSaveResponse(this.siteService.create(site));
    }
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  compareSociete(s1: ISociete | null, s2: ISociete | null): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISite>>): void {
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

  protected updateForm(site: ISite): void {
    this.editForm.patchValue({
      id: site.id,
      code: site.code,
      nom: site.nom,
      etat: site.etat,
      adresse: site.adresse,
      codePostale: site.codePostale,
      ville: site.ville,
      tel: site.tel,
      fax: site.fax,
      email: site.email,
      dateCreation: site.dateCreation ? site.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateActivation: site.dateActivation ? site.dateActivation.format(DATE_TIME_FORMAT) : null,
      dateCloture: site.dateCloture ? site.dateCloture.format(DATE_TIME_FORMAT) : null,
      societe: site.societe,
    });

    this.societesSharedCollection = this.societeService.addSocieteToCollectionIfMissing(this.societesSharedCollection, site.societe);
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

  protected createFromForm(): ISite {
    return {
      ...new Site(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      etat: this.editForm.get(['etat'])!.value,
      adresse: this.editForm.get(['adresse'])!.value,
      codePostale: this.editForm.get(['codePostale'])!.value,
      ville: this.editForm.get(['ville'])!.value,
      tel: this.editForm.get(['tel'])!.value,
      fax: this.editForm.get(['fax'])!.value,
      email: this.editForm.get(['email'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateActivation: this.editForm.get(['dateActivation'])!.value
        ? dayjs(this.editForm.get(['dateActivation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateCloture: this.editForm.get(['dateCloture'])!.value
        ? dayjs(this.editForm.get(['dateCloture'])!.value, DATE_TIME_FORMAT)
        : undefined,
      societe: this.editForm.get(['societe'])!.value,
    };
  }
}
