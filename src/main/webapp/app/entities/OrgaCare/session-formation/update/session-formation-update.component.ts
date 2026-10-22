import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ISessionFormation, SessionFormation } from '../session-formation.model';
import { SessionFormationService } from '../service/session-formation.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { IFormateur } from 'app/entities/OrgaCare/formateur/formateur.model';
import { FormateurService } from 'app/entities/OrgaCare/formateur/service/formateur.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';

@Component({
  selector: 'jhi-session-formation-update',
  templateUrl: './session-formation-update.component.html',
  styleUrls: ['./session-formation-update.component.scss'],
})
export class SessionFormationUpdateComponent implements OnInit {
  isSaving = false;

  // Accordion : seul le premier panel est ouvert au départ
  activePanels: string[] = ['panel-0'];

  // Collection pour le select des thèmes
  themesSharedCollection: IThemeFormation[] = [];

  // Collection pour le select des formateurs (affiche nomPrenom, enregistre l'id)
  formateursCollection: IFormateur[] = [];

  // Collection pour le select des sociétés (affiche raisonSociale, enregistre l'id)
  societesCollection: ISociete[] = [];

  // Listes de valeurs fixes
  typeFormationOptions: string[] = ['Inter', 'Intra'];
  statutOptions: string[] = ['Exécuter', 'Planifier'];
  budgetOptions: string[] = ['TFP', 'Suivant réglementaire'];

  editForm = this.fb.group({
    id: [],
    title: [],
    datePlanificationDu: [],
    datePlanificationAu: [],
    dateExecutionDu: [],
    dateExecutionAu: [],
    reglementaire: [],
    typeFormation: [],
    budget: [],
    coutSession: [],
    statut: [],
    additionalInformations: [],
    dateCreation: [],
    themeId: [],
    formateurId: [],
    societeId: [],
  });

  constructor(
    protected sessionFormationService: SessionFormationService,
    protected themeFormationService: ThemeFormationService,
    protected formateurService: FormateurService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadThemes();
    this.loadFormateurs();
    this.loadSocietes();
    this.activatedRoute.data.subscribe(({ sessionFormation }) => {
      if (sessionFormation.id === undefined) {
        const today = dayjs().startOf('day');
        sessionFormation.datePlanificationDu = today;
        sessionFormation.datePlanificationAu = today;
        sessionFormation.dateExecutionDu = today;
        sessionFormation.dateExecutionAu = today;
        sessionFormation.dateCreation = today;
      }

      this.updateForm(sessionFormation);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const sessionFormation = this.createFromForm();
    if (sessionFormation.id !== undefined) {
      this.subscribeToSaveResponse(this.sessionFormationService.update(sessionFormation));
    } else {
      this.subscribeToSaveResponse(this.sessionFormationService.create(sessionFormation));
    }
  }

  trackThemeById(index: number, item: IThemeFormation): number {
    return item.id!;
  }

  trackFormateurById(index: number, item: IFormateur): number {
    return item.id!;
  }

  trackSocieteById(index: number, item: ISociete): number {
    return item.id!;
  }

  protected loadThemes(): void {
    this.themeFormationService.query().subscribe((res: HttpResponse<IThemeFormation[]>) => {
      this.themesSharedCollection = res.body ?? [];
    });
  }

  protected loadFormateurs(): void {
    // size élevé : l'API des formateurs est paginée (20 par défaut)
    this.formateurService.query({ size: 1000, sort: ['nomPrenom,asc'] }).subscribe((res: HttpResponse<IFormateur[]>) => {
      this.formateursCollection = res.body ?? [];
    });
  }

  protected loadSocietes(): void {
    // size élevé : l'API des sociétés est paginée (20 par défaut)
    this.societeService.query({ size: 1000, sort: ['raisonSociale,asc'] }).subscribe((res: HttpResponse<ISociete[]>) => {
      this.societesCollection = res.body ?? [];
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISessionFormation>>): void {
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

  protected updateForm(sessionFormation: ISessionFormation): void {
    this.editForm.patchValue({
      id: sessionFormation.id,
      title: sessionFormation.title,
      datePlanificationDu: sessionFormation.datePlanificationDu ? sessionFormation.datePlanificationDu.format(DATE_TIME_FORMAT) : null,
      datePlanificationAu: sessionFormation.datePlanificationAu ? sessionFormation.datePlanificationAu.format(DATE_TIME_FORMAT) : null,
      dateExecutionDu: sessionFormation.dateExecutionDu ? sessionFormation.dateExecutionDu.format(DATE_TIME_FORMAT) : null,
      dateExecutionAu: sessionFormation.dateExecutionAu ? sessionFormation.dateExecutionAu.format(DATE_TIME_FORMAT) : null,
      reglementaire: sessionFormation.reglementaire,
      typeFormation: sessionFormation.typeFormation ?? null,
      budget: sessionFormation.budget ?? null,
      coutSession: sessionFormation.coutSession,
      statut: sessionFormation.statut ?? null,
      additionalInformations: sessionFormation.additionalInformations,
      dateCreation: sessionFormation.dateCreation ? sessionFormation.dateCreation.format(DATE_TIME_FORMAT) : null,
      themeId: sessionFormation.themeId ?? null,
      formateurId: sessionFormation.formateurId ?? null,
      societeId: sessionFormation.societeId ?? null,
    });
  }

  protected createFromForm(): ISessionFormation {
    return {
      ...new SessionFormation(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      datePlanificationDu: this.editForm.get(['datePlanificationDu'])!.value
        ? dayjs(this.editForm.get(['datePlanificationDu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      datePlanificationAu: this.editForm.get(['datePlanificationAu'])!.value
        ? dayjs(this.editForm.get(['datePlanificationAu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateExecutionDu: this.editForm.get(['dateExecutionDu'])!.value
        ? dayjs(this.editForm.get(['dateExecutionDu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateExecutionAu: this.editForm.get(['dateExecutionAu'])!.value
        ? dayjs(this.editForm.get(['dateExecutionAu'])!.value, DATE_TIME_FORMAT)
        : undefined,
      reglementaire: this.editForm.get(['reglementaire'])!.value,
      typeFormation: this.editForm.get(['typeFormation'])!.value,
      budget: this.editForm.get(['budget'])!.value,
      coutSession: this.editForm.get(['coutSession'])!.value,
      statut: this.editForm.get(['statut'])!.value,
      additionalInformations: this.editForm.get(['additionalInformations'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      themeId: this.editForm.get(['themeId'])!.value,
      formateurId: this.editForm.get(['formateurId'])!.value,
      societeId: this.editForm.get(['societeId'])!.value,
    };
  }
}
