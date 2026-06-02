import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISociete, Societe } from '../societe.model';
import { SocieteService } from '../service/societe.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IFormeJuridique } from 'app/entities/OrgaCare/forme-juridique/forme-juridique.model';
import { FormeJuridiqueService } from 'app/entities/OrgaCare/forme-juridique/service/forme-juridique.service';
import { Etat } from 'app/entities/enumerations/etat.model';
import { OrganigrammeService } from '../../organigramme/service/organigramme.service';
// import { IOrgacareCode } from '../orgacare-code.model';
import { IOrganigrammeCode } from 'app/entities/OrgaCare/organigramme/organigramme.model';

@Component({
  selector: 'jhi-societe-update',
  templateUrl: './societe-update.component.html',
  styleUrls: ['./societe-update.component.scss'],
})
export class SocieteUpdateComponent implements OnInit {
  isSaving = false;
  etatValues = Object.keys(Etat);

  formeJuridiquesSharedCollection: IFormeJuridique[] = [];
  organigrammesCodes: IOrganigrammeCode[] = [];

  SocieteItems = ['Section Générale', 'Section Communication', 'Section Médias'];
  activePanels: string[] = ['panel-0'];
  disablePanelTitle: boolean[] = [];

  editForm = this.fb.group({
    id: [],
    raisonSociale: [null, [Validators.required]],
    abreviation: [],
    activite: [],
    formeJuridique: [],
    adresse: [],
    codePostale: [],
    ville: [],
    pays: [],
    region: [],
    tel: [],
    fax: [],
    mail: [],
    siteInternet: [],
    matriculeFiscale: [],
    logo: [],
    logoContentType: [],
    imagesSitePrincipale: [],
    imagesSitePrincipaleContentType: [],
    holding: [],
    etat: [null, [Validators.required]],
    dateCreation: [],
    dateActivation: [],
    dateCloture: [],
    importTemplate: [],
    importTemplateContentType: [],
    codeSociete: [null, []],
    codeOrganigramme: [null, [Validators.required]],
    formeJuridiquee: [],
  });

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected societeService: SocieteService,
    protected organigrammeService: OrganigrammeService,
    protected formeJuridiqueService: FormeJuridiqueService,
    protected elementRef: ElementRef,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ societe }) => {
      if (societe.id === undefined) {
        const today = dayjs().startOf('day');
        societe.dateCreation = today;
        societe.dateActivation = today;
        societe.dateCloture = today;
      }
      this.loadRelationshipsOptions();
      this.loadOrganigrammesCodes(() => this.updateForm(societe));
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('orgacaregatewayApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  clearInputImage(field: string, fieldContentType: string, idInput: string): void {
    this.editForm.patchValue({
      [field]: null,
      [fieldContentType]: null,
    });
    if (idInput && this.elementRef.nativeElement.querySelector('#' + idInput)) {
      this.elementRef.nativeElement.querySelector('#' + idInput).value = null;
    }
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const societe = this.createFromForm();
    if (societe.id !== undefined) {
      this.subscribeToSaveResponse(this.societeService.update(societe));
    } else {
      this.subscribeToSaveResponse(this.societeService.create(societe));
    }
  }

  trackFormeJuridiqueById(index: number, item: IFormeJuridique): number {
    return item.id!;
  }

  togglePanel(item: string): void {
    const panelId = `panel-${this.SocieteItems.indexOf(item)}`;
    const index = this.activePanels.indexOf(panelId);
    if (index > -1) {
      this.activePanels.splice(index, 1);
    } else {
      this.activePanels.push(panelId);
    }
  }

  isPanelOpen(item: string): boolean {
    const panelId = `panel-${this.SocieteItems.indexOf(item)}`;
    return this.activePanels.includes(panelId);
  }

  loadOrganigrammesCodes(callback?: () => void): void {
    this.organigrammeService.findAllCodes().subscribe(
      (codes: IOrganigrammeCode[]) => {
        this.organigrammesCodes = codes;
        callback?.();
      },
      () => {
        this.organigrammesCodes = [];
        callback?.();
      }
    );
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISociete>>): void {
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

  protected updateForm(societe: ISociete): void {
    this.editForm.patchValue({
      id: societe.id,
      raisonSociale: societe.raisonSociale,
      abreviation: societe.abreviation,
      activite: societe.activite,
      formeJuridique: societe.formeJuridique,
      adresse: societe.adresse,
      codePostale: societe.codePostale,
      ville: societe.ville,
      pays: societe.pays,
      region: societe.region,
      tel: societe.tel,
      fax: societe.fax,
      mail: societe.mail,
      siteInternet: societe.siteInternet,
      matriculeFiscale: societe.matriculeFiscale,
      logo: societe.logo,
      logoContentType: societe.logoContentType,
      imagesSitePrincipale: societe.imagesSitePrincipale,
      imagesSitePrincipaleContentType: societe.imagesSitePrincipaleContentType,
      holding: societe.holding,
      etat: societe.etat,
      dateCreation: societe.dateCreation ? societe.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateActivation: societe.dateActivation ? societe.dateActivation.format(DATE_TIME_FORMAT) : null,
      dateCloture: societe.dateCloture ? societe.dateCloture.format(DATE_TIME_FORMAT) : null,
      importTemplate: societe.importTemplate,
      importTemplateContentType: societe.importTemplateContentType,
      codeSociete: societe.codeSociete,
      codeOrganigramme: societe.codeOrganigramme,
      formeJuridiquee: societe.formeJuridiquee,
    });

    this.formeJuridiquesSharedCollection = this.formeJuridiqueService.addFormeJuridiqueToCollectionIfMissing(
      this.formeJuridiquesSharedCollection,
      societe.formeJuridiquee
    );
  }

  protected loadRelationshipsOptions(): void {
    this.formeJuridiqueService
      .query()
      .pipe(map((res: HttpResponse<IFormeJuridique[]>) => res.body ?? []))
      .pipe(
        map((formeJuridiques: IFormeJuridique[]) =>
          this.formeJuridiqueService.addFormeJuridiqueToCollectionIfMissing(formeJuridiques, this.editForm.get('formeJuridiquee')!.value)
        )
      )
      .subscribe((formeJuridiques: IFormeJuridique[]) => (this.formeJuridiquesSharedCollection = formeJuridiques));
  }

  protected createFromForm(): ISociete {
    return {
      ...new Societe(),
      id: this.editForm.get(['id'])!.value,
      raisonSociale: this.editForm.get(['raisonSociale'])!.value,
      abreviation: this.editForm.get(['abreviation'])!.value,
      activite: this.editForm.get(['activite'])!.value,
      formeJuridique: this.editForm.get(['formeJuridique'])!.value,
      adresse: this.editForm.get(['adresse'])!.value,
      codePostale: this.editForm.get(['codePostale'])!.value,
      ville: this.editForm.get(['ville'])!.value,
      pays: this.editForm.get(['pays'])!.value,
      region: this.editForm.get(['region'])!.value,
      tel: this.editForm.get(['tel'])!.value,
      fax: this.editForm.get(['fax'])!.value,
      mail: this.editForm.get(['mail'])!.value,
      siteInternet: this.editForm.get(['siteInternet'])!.value,
      matriculeFiscale: this.editForm.get(['matriculeFiscale'])!.value,
      logoContentType: this.editForm.get(['logoContentType'])!.value,
      logo: this.editForm.get(['logo'])!.value,
      imagesSitePrincipaleContentType: this.editForm.get(['imagesSitePrincipaleContentType'])!.value,
      imagesSitePrincipale: this.editForm.get(['imagesSitePrincipale'])!.value,
      holding: this.editForm.get(['holding'])!.value,
      etat: this.editForm.get(['etat'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateActivation: this.editForm.get(['dateActivation'])!.value
        ? dayjs(this.editForm.get(['dateActivation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateCloture: this.editForm.get(['dateCloture'])!.value
        ? dayjs(this.editForm.get(['dateCloture'])!.value, DATE_TIME_FORMAT)
        : undefined,
      importTemplateContentType: this.editForm.get(['importTemplateContentType'])!.value,
      importTemplate: this.editForm.get(['importTemplate'])!.value,
      codeSociete: this.editForm.get(['codeSociete'])!.value,
      codeOrganigramme: this.editForm.get(['codeOrganigramme'])!.value,
      formeJuridiquee: this.editForm.get(['formeJuridiquee'])!.value,
    };
  }
}
