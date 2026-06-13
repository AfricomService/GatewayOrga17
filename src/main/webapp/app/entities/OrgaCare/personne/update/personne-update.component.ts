import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import * as dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IPersonne, Personne } from '../personne.model';
import { PersonneService } from '../service/personne.service';
import { IAffectation } from 'app/entities/OrgaCare/affectation/affectation.model';
import { AffectationService } from 'app/entities/OrgaCare/affectation/service/affectation.service';
import { IGrade } from 'app/entities/OrgaCare/grade/grade.model';
import { GradeService } from 'app/entities/OrgaCare/grade/service/grade.service';
import { IFonction } from 'app/entities/OrgaCare/fonction/fonction.model';
import { FonctionService } from 'app/entities/OrgaCare/fonction/service/fonction.service';
import { Etat } from 'app/entities/enumerations/etat.model';
import { EtatContractuelle } from 'app/entities/enumerations/etat-contractuelle.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { KeycloakSyncService, KeycloakSyncResult } from 'app/core/keycloak/keycloak-sync.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';
import { IDepartement } from 'app/entities/OrgaCare/departement/departement.model';
import { DepartementService } from 'app/entities/OrgaCare/departement/service/departement.service';
import { IAffecterPersonneRequest } from 'app/entities/OrgaCare/affectation/service/affectation.service';
import { TypeAffectation } from 'app/entities/enumerations/type-affectation.model';
import { IContrat } from 'app/entities/OrgaCare/contrat/contrat.model';
import { ContratService } from 'app/entities/OrgaCare/contrat/service/contrat.service';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';
import { TypeContratService } from 'app/entities/OrgaCare/type-contrat/service/type-contrat.service';

@Component({
  selector: 'jhi-personne-update',
  templateUrl: './personne-update.component.html',
  styleUrls: ['./personne-update.component.scss'],
})
export class PersonneUpdateComponent implements OnInit {
  isSaving = false;

  // Enumerations exposées au template
  etatValues = Object.keys(Etat);
  etatContractuelleValues = Object.keys(EtatContractuelle);

  // Collections pour les selects
  affectationsSharedCollection: IAffectation[] = [];
  gradesSharedCollection: IGrade[] = [];
  fonctionsSharedCollection: IFonction[] = [];

  // Logique métier conservée de l'ancienne version
  generateMatriculeAutomatically = false;

  // Accordion / panels (conservé de l'ancienne version)
  personItems = ['Section Générale'];
  editPanels = ['Affectation en cours', 'Contrat', 'Absence'];
  activePanels: string[] = ['panel-0'];
  disablePanelTitle: boolean[] = [];
  // Propriétés pour la modal d'affectation user
  availableUsers: IUser[] = [];
  filteredUsers: IUser[] = [];
  selectedUser: IUser | null = null;
  isLoadingUsers = false;
  isAssigning = false;
  userSearchKeyword = '';

  // Pagination users dans la modal
  userPage = 1;
  userItemsPerPage = 5;
  userTotalItems = 0;

  isSyncing = false;
  syncResult: KeycloakSyncResult | null = null;
  syncError: string | null = null;
  // ── Accordéon Affectation ────────────────────────────
  affectationsPersonne: IAffectation[] = [];
  isLoadingAffectations = false;

  // Modal affecter département
  isAffectationSaving = false;
  affectationSaveError: string | null = null;
  affectationSaveSuccess = false;
  // Modal ajout contrat
  isContratSaving = false;
  contratSaveError: string | null = null;
  contratSaveSuccess = false;
  contratsPersonne: IContrat[] = [];
  isLoadingContrats = false;

  typesContratCollection: ITypeContrat[] = [];
  societesContratCollection: ISociete[] = [];

  newContratDateDebut: string = dayjs().format('YYYY-MM-DD');
  newContratDateFin: string | null = null;
  newContratTypeContratId: number | null = null;
  newContratSocieteId: number | null = null;

  affectationRoleActif: TypeAffectation = TypeAffectation.CHEF;
  affectationDateAction: string = dayjs().format('YYYY-MM-DD');
  affectationDateFin: string | null = null;

  societesCollection: ISociete[] = [];
  organigrammesCollection: IOrganigramme[] = [];
  departementsCollection: IDepartement[] = [];

  departementTree: any[] = [];
  expandedDeptNodes = new Set<number>();

  selectedSocieteId: number | null = null;
  selectedOrganigrammeId: number | null = null;
  selectedDepartementId: number | null = null;

  selectedDeptLabel = '';

  // NOUVEAU
  editForm = this.fb.group({
    id: [],
    matricule: [],
    nomPrenom: [null, [Validators.required]],
    email: [null, [Validators.email]],
    numTelephone: [],
    genre: [],
    cin: [],
    etat: [null],
    etatContractuelle: [null],
    dateCreation: [],
    dateDebutContrat: [],
    idContratActif: [],
    idTypeContratActif: [],
    userId: [],
    affectation: [],
    grade: [],
    fonction: [],
  });

  private affectationModalRef?: NgbModalRef;
  private assignModalRef?: NgbModalRef;
  private contratModalRef?: NgbModalRef;

  constructor(
    protected personneService: PersonneService,
    protected affectationService: AffectationService,
    protected gradeService: GradeService,
    protected fonctionService: FonctionService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected modalService: NgbModal,
    protected userService: UserService,
    private cdr: ChangeDetectorRef,
    private keycloakSyncService: KeycloakSyncService,
    protected societeService: SocieteService,
    protected organigrammeService: OrganigrammeService,
    protected departementService: DepartementService,
    protected contratService: ContratService,
    protected typeContratService: TypeContratService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ personne }) => {
      if (personne.id === undefined) {
        const today = dayjs().startOf('day');
        personne.dateCreation = today;
        personne.dateDebutContrat = today;
      }

      // Charger grades et fonctions en premier, puis initialiser le formulaire
      this.gradeService
        .query()
        .pipe(map((res: HttpResponse<IGrade[]>) => res.body ?? []))
        .subscribe(grades => {
          this.gradesSharedCollection = grades;
          this.fonctionService
            .query()
            .pipe(map((res: HttpResponse<IFonction[]>) => res.body ?? []))
            .subscribe(fonctions => {
              this.fonctionsSharedCollection = fonctions;
              this.updateForm(personne);
              if (personne.id !== undefined) {
                this.loadAffectationsPersonne(personne.id);
                this.loadContratsPersonne(personne.id);
              }
              this.cdr.markForCheck();
            });
        });

      if (this.generateMatriculeAutomatically && personne.id === undefined) {
        this.personneService.generateNextMatricule('Empl-').subscribe(nextCode => {
          this.editForm.get('matricule')?.setValue(nextCode);
          this.cdr.markForCheck();
        });
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const personne = this.createFromForm();
    if (personne.id !== undefined) {
      this.subscribeToSaveResponse(this.personneService.update(personne));
    } else {
      this.subscribeToSaveResponse(this.personneService.create(personne));
    }
  }

  syncKeycloakUsers(): void {
    this.isSyncing = true;
    this.syncResult = null;
    this.syncError = null;

    this.keycloakSyncService.syncNow().subscribe({
      next: result => {
        this.isSyncing = false;
        this.syncResult = result;
        this.cdr.markForCheck();
        // Recharger la liste des users après sync
        this.loadAvailableUsers();
      },
      error: err => {
        this.isSyncing = false;
        this.syncError = 'Erreur lors de la synchronisation. Vérifiez la connexion Keycloak.';
        this.cdr.markForCheck();
        console.error(err);
      },
    });
  }

  openAssignUserModal(content: unknown): void {
    this.selectedUser = null;
    this.userSearchKeyword = '';
    this.userPage = 1;
    this.loadAvailableUsers();
    this.assignModalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  loadAvailableUsers(): void {
    this.isLoadingUsers = true;
    // Charge tous les users publics + les userIds déjà assignés en parallèle
    this.userService.query({ page: 0, size: 100, sort: ['id,asc'] }).subscribe(
      (usersRes: HttpResponse<IUser[]>) => {
        const allUsers = usersRes.body ?? [];
        this.personneService.getAssignedUserIds().subscribe(
          (assignedIds: string[]) => {
            // Filtre les users déjà assignés
            this.availableUsers = allUsers.filter(u => u.id && !assignedIds.includes(u.id));
            this.applyUserFilter();
            this.isLoadingUsers = false;
          },
          () => {
            this.availableUsers = allUsers;
            this.applyUserFilter();
            this.isLoadingUsers = false;
          }
        );
      },
      () => {
        this.isLoadingUsers = false;
      }
    );
  }

  applyUserFilter(): void {
    const kw = this.userSearchKeyword.toLowerCase().trim();
    const filtered = kw
      ? this.availableUsers.filter(
          u =>
            (u.login ?? '').toLowerCase().includes(kw) ||
            (u.email ?? '').toLowerCase().includes(kw) ||
            ((u.firstName ?? '') + ' ' + (u.lastName ?? '')).toLowerCase().includes(kw)
        )
      : this.availableUsers;
    this.userTotalItems = filtered.length;
    const start = (this.userPage - 1) * this.userItemsPerPage;
    this.filteredUsers = filtered.slice(start, start + this.userItemsPerPage);
  }

  selectUser(user: IUser): void {
    this.selectedUser = this.selectedUser?.id === user.id ? null : user;
  }

  confirmAssignUser(): void {
    if (!this.selectedUser?.id) {
      return;
    }
    const personneId = this.editForm.get('id')!.value as number;
    this.isAssigning = true;
    this.personneService.assignUser(personneId, this.selectedUser.id).subscribe(
      res => {
        this.isAssigning = false;
        if (res.body) {
          this.editForm.patchValue({ userId: res.body.userId });
        }
        this.assignModalRef?.close();
      },
      () => {
        this.isAssigning = false;
      }
    );
  }

  compareGrade(g1: IGrade | null, g2: IGrade | null): boolean {
    return g1 && g2 ? g1.id === g2.id : g1 === g2;
  }

  compareFonction(f1: IFonction | null, f2: IFonction | null): boolean {
    return f1 && f2 ? f1.id === f2.id : f1 === f2;
  }

  trackAffectationById(index: number, item: IAffectation): number {
    return item.id!;
  }

  trackGradeById(index: number, item: IGrade): number {
    return item.id!;
  }

  trackFonctionById(index: number, item: IFonction): number {
    return item.id!;
  }
  // ── Chargement affectations existantes ───────────────
  loadAffectationsPersonne(personneId: number): void {
    this.isLoadingAffectations = true;
    this.affectationService.findAffectationsActivesByPersonneId(personneId).subscribe(
      (affectations: IAffectation[]) => {
        this.affectationsPersonne = affectations;
        this.isLoadingAffectations = false;
        this.cdr.markForCheck();
      },
      () => {
        this.isLoadingAffectations = false;
        this.cdr.markForCheck();
      }
    );
  }

  // ── Ouverture modal affecter département ─────────────
  openAffecterDepartementModal(content: unknown): void {
    this.affectationRoleActif = TypeAffectation.CHEF;
    this.affectationDateAction = dayjs().format('YYYY-MM-DD');
    this.affectationDateFin = null;
    this.selectedSocieteId = null;
    this.selectedOrganigrammeId = null;
    this.selectedDepartementId = null;
    this.organigrammesCollection = [];
    this.departementsCollection = [];
    this.affectationSaveError = null;
    this.affectationSaveSuccess = false;
    this.departementTree = [];
    this.selectedDeptLabel = '';
    this.expandedDeptNodes = new Set<number>();

    this.societeService.query({ size: 100 }).subscribe((res: HttpResponse<ISociete[]>) => {
      this.societesCollection = res.body ?? [];
      this.cdr.markForCheck();
    });

    this.affectationModalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  // ── Cascade Société → Organigramme ───────────────────
  onSocieteChange(societeId: number | null): void {
    this.selectedSocieteId = societeId;
    this.selectedOrganigrammeId = null;
    this.selectedDepartementId = null;
    this.organigrammesCollection = [];
    this.departementsCollection = [];

    if (!societeId) {
      return;
    }

    this.organigrammeService.findBySocieteId(societeId).subscribe((organigrammes: IOrganigramme[]) => {
      this.organigrammesCollection = organigrammes;
      this.cdr.markForCheck();
    });
  }

  // ── Cascade Organigramme → Département ───────────────
  onOrganigrammeChange(organigrammeId: number | null): void {
    this.selectedOrganigrammeId = organigrammeId;
    this.selectedDepartementId = null;
    this.departementTree = [];
    this.expandedDeptNodes.clear();

    if (!organigrammeId) {
      return;
    }

    // Récupérer le code de l'organigramme sélectionné
    const orga = this.organigrammesCollection.find(o => o.id === organigrammeId);
    if (!orga?.code) {
      return;
    }

    this.departementService.getTree(orga.code).subscribe((tree: any[]) => {
      this.departementTree = tree;
      // Auto-expand le premier niveau
      tree.forEach((node: any) => this.expandedDeptNodes.add(node.id));
      this.cdr.markForCheck();
    });
  }

  // ── Confirmation affectation ──────────────────────────
  confirmAffecterDepartement(): void {
    if (!this.selectedDepartementId) {
      this.affectationSaveError = 'Veuillez sélectionner un département.';
      return;
    }

    const personneId = this.editForm.get('id')!.value as number;
    this.isAffectationSaving = true;
    this.affectationSaveError = null;

    const request: IAffecterPersonneRequest = {
      personneId,
      departementId: this.selectedDepartementId,
      societeId: this.selectedSocieteId,
      type: this.affectationRoleActif,
      dateAction: this.affectationDateAction ? dayjs(this.affectationDateAction).toISOString() : null,
      dateFin: this.affectationDateFin ? dayjs(this.affectationDateFin).toISOString() : null,
    };

    this.affectationService.affecterPersonne(request).subscribe(
      () => {
        this.isAffectationSaving = false;
        this.affectationSaveSuccess = true;
        this.loadAffectationsPersonne(personneId);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.affectationModalRef?.close();
          this.affectationSaveSuccess = false;
        }, 1000);
      },
      () => {
        this.isAffectationSaving = false;
        this.affectationSaveError = "Erreur lors de l'affectation. Veuillez réessayer.";
        this.cdr.markForCheck();
      }
    );
  }

  loadContratsPersonne(personneId: number): void {
    this.isLoadingContrats = true;
    this.contratService.findByPersonneId(personneId).subscribe(
      (contrats: IContrat[]) => {
        this.contratsPersonne = contrats;
        this.isLoadingContrats = false;
        this.cdr.markForCheck();
      },
      () => {
        this.isLoadingContrats = false;
        this.cdr.markForCheck();
      }
    );
  }

  openAjouterContratModal(content: unknown): void {
    this.newContratDateDebut = dayjs().format('YYYY-MM-DD');
    this.newContratDateFin = null;
    this.newContratTypeContratId = null;
    this.newContratSocieteId = null;
    this.contratSaveError = null;
    this.contratSaveSuccess = false;

    this.typeContratService.query({ size: 100 }).subscribe((res: HttpResponse<ITypeContrat[]>) => {
      this.typesContratCollection = res.body ?? [];
      this.cdr.markForCheck();
    });

    this.societeService.query({ size: 100 }).subscribe((res: HttpResponse<ISociete[]>) => {
      this.societesContratCollection = res.body ?? [];
      this.cdr.markForCheck();
    });

    this.contratModalRef = this.modalService.open(content, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  confirmAjouterContrat(): void {
    if (!this.newContratDateDebut) {
      this.contratSaveError = 'La date de début est obligatoire.';
      return;
    }

    const personneId = this.editForm.get('id')!.value as number;
    this.isContratSaving = true;
    this.contratSaveError = null;

    const contratDTO: IContrat = {
      dateDebut: dayjs(this.newContratDateDebut),
      dateFin: this.newContratDateFin ? dayjs(this.newContratDateFin) : null,
      typeContratId: this.newContratTypeContratId,
      societeId: this.newContratSocieteId,
      personneId,
      status: 'ACTIF',
    };

    this.contratService.create(contratDTO).subscribe(
      () => {
        this.isContratSaving = false;
        this.contratSaveSuccess = true;
        this.loadContratsPersonne(personneId);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.contratModalRef?.close();
          this.contratSaveSuccess = false;
        }, 1000);
      },
      () => {
        this.isContratSaving = false;
        this.contratSaveError = "Erreur lors de l'enregistrement du contrat.";
        this.cdr.markForCheck();
      }
    );
  }

  toggleDeptNode(nodeId: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedDeptNodes.has(nodeId)) {
      this.expandedDeptNodes.delete(nodeId);
    } else {
      this.expandedDeptNodes.add(nodeId);
    }
  }

  isDeptNodeExpanded(nodeId: number): boolean {
    return this.expandedDeptNodes.has(nodeId);
  }

  selectDeptFromTree(node: any): void {
    this.selectedDepartementId = node.id;
    this.selectedDeptLabel = node.nom ?? node.code ?? String(node.id);
  }

  // ── Sélection du rôle ─────────────────────────────────
  setAffectationRole(role: string): void {
    this.affectationRoleActif = role as TypeAffectation;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPersonne>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      (res: HttpResponse<IPersonne>) => this.onSaveSuccess(res.body),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(personne: IPersonne | null): void {
    if (personne) {
      // Met à jour le formulaire avec les données renvoyées (notamment le nouvel id)
      this.updateForm(personne);

      // Si c'était une création, on a maintenant un id : on peut charger
      // les sections "Affectation" et "Contrat" qui n'apparaissaient pas avant
      if (personne.id !== undefined) {
        this.loadAffectationsPersonne(personne.id);
        this.loadContratsPersonne(personne.id);
      }
    }
    this.cdr.markForCheck();
  }

  protected onSaveError(): void {
    // Héritage API
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(personne: IPersonne): void {
    // Résoudre grade et fonction depuis leurs IDs si les objets ne sont pas fournis
    const resolvedGrade: IGrade | null =
      personne.grade ?? (personne.gradeId ? this.gradesSharedCollection.find(g => g.id === personne.gradeId) ?? null : null);

    const resolvedFonction: IFonction | null =
      personne.fonction ?? (personne.fonctionId ? this.fonctionsSharedCollection.find(f => f.id === personne.fonctionId) ?? null : null);

    this.editForm.patchValue({
      id: personne.id,
      matricule: personne.matricule,
      nomPrenom: personne.nomPrenom,
      email: personne.email,
      numTelephone: personne.numTelephone,
      genre: personne.genre,
      cin: personne.cin,
      dateCreation: personne.dateCreation ? personne.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateDebutContrat: personne.dateDebutContrat ? personne.dateDebutContrat.format(DATE_TIME_FORMAT) : null,
      idContratActif: personne.idContratActif,
      idTypeContratActif: personne.idTypeContratActif,
      userId: personne.userId,
      affectation: personne.affectation,
      grade: resolvedGrade,
      fonction: resolvedFonction,
    });

    setTimeout(() => {
      this.editForm.patchValue({
        etat: personne.etat,
        etatContractuelle: personne.etatContractuelle,
      });
      this.cdr.markForCheck();
    }, 0);

    this.affectationsSharedCollection = this.affectationService.addAffectationToCollectionIfMissing(
      this.affectationsSharedCollection,
      personne.affectation
    );
    this.gradesSharedCollection = this.gradeService.addGradeToCollectionIfMissing(this.gradesSharedCollection, resolvedGrade);
    this.fonctionsSharedCollection = this.fonctionService.addFonctionToCollectionIfMissing(
      this.fonctionsSharedCollection,
      resolvedFonction
    );
  }

  protected loadRelationshipsOptions(): void {
    this.gradeService
      .query()
      .pipe(map((res: HttpResponse<IGrade[]>) => res.body ?? []))
      .pipe(map((grades: IGrade[]) => this.gradeService.addGradeToCollectionIfMissing(grades, this.editForm.get('grade')!.value)))
      .subscribe((grades: IGrade[]) => (this.gradesSharedCollection = grades));

    this.fonctionService
      .query()
      .pipe(map((res: HttpResponse<IFonction[]>) => res.body ?? []))
      .pipe(
        map((fonctions: IFonction[]) =>
          this.fonctionService.addFonctionToCollectionIfMissing(fonctions, this.editForm.get('fonction')!.value)
        )
      )
      .subscribe((fonctions: IFonction[]) => (this.fonctionsSharedCollection = fonctions));
  }

  protected createFromForm(): IPersonne {
    return {
      ...new Personne(),
      id: this.editForm.get(['id'])!.value,
      matricule: this.editForm.get(['matricule'])!.value,
      nomPrenom: this.editForm.get(['nomPrenom'])!.value,
      email: this.editForm.get(['email'])!.value,
      numTelephone: this.editForm.get(['numTelephone'])!.value,
      genre: this.editForm.get(['genre'])!.value,
      cin: this.editForm.get(['cin'])!.value,
      etat: this.editForm.get(['etat'])!.value,
      etatContractuelle: this.editForm.get(['etatContractuelle'])!.value,
      dateCreation: this.editForm.get(['dateCreation'])!.value
        ? dayjs(this.editForm.get(['dateCreation'])!.value, DATE_TIME_FORMAT)
        : undefined,
      dateDebutContrat: this.editForm.get(['dateDebutContrat'])!.value
        ? dayjs(this.editForm.get(['dateDebutContrat'])!.value, DATE_TIME_FORMAT)
        : undefined,
      idContratActif: this.editForm.get(['idContratActif'])!.value,
      idTypeContratActif: this.editForm.get(['idTypeContratActif'])!.value,
      userId: this.editForm.get(['userId'])!.value,
      affectation: this.editForm.get(['affectation'])!.value,
      grade: this.editForm.get(['grade'])!.value,
      gradeId: (this.editForm.get(['grade'])!.value as IGrade | null)?.id ?? null,
      fonction: this.editForm.get(['fonction'])!.value,
      fonctionId: (this.editForm.get(['fonction'])!.value as IFonction | null)?.id ?? null,
    };
  }
}
