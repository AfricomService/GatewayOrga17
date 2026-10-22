import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneSelectionModalComponent } from '../personne-selection-modal/personne-selection-modal.component';

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
  activePanels: string[] = ['panel-0', 'panel-2'];

  // Collection pour le select des thèmes
  themesSharedCollection: IThemeFormation[] = [];

  // Collection pour le select des formateurs (affiche nomPrenom, enregistre l'id)
  formateursCollection: IFormateur[] = [];

  // Collection pour le select des sociétés (affiche raisonSociale, enregistre l'id)
  societesCollection: ISociete[] = [];

  // Personnes de la société sélectionnée
  personnesSociete: IPersonne[] = [];
  chefsSociete: IPersonne[] = [];
  loadingPersonnes = false;

  // Affichage des éléments sélectionnés (chips)
  selectedParticipants: IPersonne[] = [];
  selectedChefs: IPersonne[] = [];

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
    participantIds: [[]],
    chefProjetIds: [[]],
  });

  private currentSocieteId: number | null = null;

  constructor(
    protected sessionFormationService: SessionFormationService,
    protected themeFormationService: ThemeFormationService,
    protected formateurService: FormateurService,
    protected societeService: SocieteService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected modalService: NgbModal
  ) {}

  get hasSociete(): boolean {
    return !!this.editForm.get('societeId')!.value;
  }

  ngOnInit(): void {
    this.loadThemes();
    this.loadFormateurs();
    this.loadSocietes();
    // Changement de société par l'utilisateur → on vide les sélections et on recharge
    this.editForm.get('societeId')!.valueChanges.subscribe((id: number | null) => this.onSocieteChanged(id));
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
    const save$ =
      sessionFormation.id != null
        ? this.sessionFormationService.update(sessionFormation)
        : this.sessionFormationService.create(sessionFormation);

    save$
      .pipe(
        switchMap((res: HttpResponse<ISessionFormation>) => {
          const sessionId = res.body!.id!;
          return forkJoin([
            this.sessionFormationService.saveParticipants(sessionId, this.editForm.get('participantIds')!.value ?? []),
            this.sessionFormationService.saveChefs(sessionId, this.editForm.get('chefProjetIds')!.value ?? []),
          ]).pipe(switchMap(() => this.sessionFormationService.syncFormations(sessionId)));
        }),
        finalize(() => this.onSaveFinalize())
      )
      .subscribe(
        () => this.onSaveSuccess(),
        () => this.onSaveError()
      );
  }

  trackPersonneById(index: number, item: IPersonne): number {
    return item.id!;
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

  // ───────── Sélection (modal) ─────────
  openParticipantsModal(): void {
    this.openSelectionModal('Sélectionner les participants', this.personnesSociete, 'participantIds');
  }

  openChefsModal(): void {
    this.openSelectionModal('Sélectionner les chefs de projet', this.chefsSociete, 'chefProjetIds');
  }

  removeParticipant(id: number): void {
    this.removeId('participantIds', id);
  }

  removeChef(id: number): void {
    this.removeId('chefProjetIds', id);
  }

  // ───────── Société → personnes ─────────
  protected onSocieteChanged(societeId: number | null): void {
    if (societeId === this.currentSocieteId) {
      return;
    }
    this.currentSocieteId = societeId;
    this.editForm.patchValue({ participantIds: [], chefProjetIds: [] }, { emitEvent: false });
    this.refreshSelection();
    this.loadPersonnesOfSociete(societeId);
  }

  protected loadPersonnesOfSociete(societeId: number | null): void {
    this.personnesSociete = [];
    this.chefsSociete = [];
    if (!societeId) {
      this.refreshSelection();
      return;
    }
    this.loadingPersonnes = true;
    forkJoin([
      this.sessionFormationService.findPersonnesBySociete(societeId),
      this.sessionFormationService.findPersonnesBySociete(societeId, 'CHEF'),
    ])
      .pipe(finalize(() => (this.loadingPersonnes = false)))
      .subscribe(([personnes, chefs]) => {
        this.personnesSociete = personnes;
        this.chefsSociete = chefs;
        this.refreshSelection();
      });
  }

  protected openSelectionModal(title: string, personnes: IPersonne[], controlName: 'participantIds' | 'chefProjetIds'): void {
    const modalRef = this.modalService.open(PersonneSelectionModalComponent, { size: 'lg', backdrop: 'static', scrollable: true });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.personnes = personnes;
    modalRef.componentInstance.selectedIds = this.editForm.get(controlName)!.value ?? [];
    modalRef.result.then(
      (ids: number[]) => {
        this.editForm.get(controlName)!.setValue(ids);
        this.refreshSelection();
      },
      () => {
        // modal fermée sans validation
      }
    );
  }

  protected removeId(controlName: 'participantIds' | 'chefProjetIds', id: number): void {
    const ids: number[] = this.editForm.get(controlName)!.value ?? [];
    this.editForm.get(controlName)!.setValue(ids.filter(i => i !== id));
    this.refreshSelection();
  }

  protected refreshSelection(): void {
    const toPersonnes = (ids: number[], source: IPersonne[]): IPersonne[] =>
      ids.map(id => source.find(p => p.id === id) ?? ({ id, nomPrenom: `#${id}` } as IPersonne));
    this.selectedParticipants = toPersonnes(this.editForm.get('participantIds')!.value ?? [], this.personnesSociete);
    this.selectedChefs = toPersonnes(this.editForm.get('chefProjetIds')!.value ?? [], this.chefsSociete);
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

    // Chargement des personnes de la société + des sélections existantes (mode édition)
    this.currentSocieteId = sessionFormation.societeId ?? null;
    this.loadPersonnesOfSociete(this.currentSocieteId);

    if (sessionFormation.id != null) {
      forkJoin([
        this.sessionFormationService.getParticipantIds(sessionFormation.id),
        this.sessionFormationService.getChefIds(sessionFormation.id),
      ]).subscribe(([participantIds, chefIds]) => {
        this.editForm.patchValue({ participantIds, chefProjetIds: chefIds }, { emitEvent: false });
        this.refreshSelection();
      });
    }
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
