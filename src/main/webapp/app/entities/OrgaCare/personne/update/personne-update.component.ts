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
  personItems = ['Section Générale', 'Informations Contractuelles'];
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

  editForm = this.fb.group({
    id: [],
    matricule: [],
    nomPrenom: [null, [Validators.required]],
    email: [null, [Validators.email]],
    numTelephone: [],
    genre: [],
    cin: [],
    etat: [null, [Validators.required]],
    etatContractuelle: [null, [Validators.required]],
    dateCreation: [],
    dateDebutContrat: [],
    idContratActif: [],
    idTypeContratActif: [],
    userId: [],
    affectation: [],
    grade: [],
    fonction: [],
  });
  private assignModalRef?: NgbModalRef;

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
    private keycloakSyncService: KeycloakSyncService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ personne }) => {
      if (personne.id === undefined) {
        const today = dayjs().startOf('day');
        personne.dateCreation = today;
        personne.dateDebutContrat = today;
      }

      this.updateForm(personne);
      this.loadRelationshipsOptions();
      this.cdr.markForCheck();

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

  trackAffectationById(index: number, item: IAffectation): number {
    return item.id!;
  }

  trackGradeById(index: number, item: IGrade): number {
    return item.id!;
  }

  trackFonctionById(index: number, item: IFonction): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPersonne>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Héritage API
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(personne: IPersonne): void {
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
      grade: personne.grade,
      fonction: personne.fonction,
    });

    // Patch les selects enum dans un setTimeout pour forcer le rendu Angular
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
    this.gradesSharedCollection = this.gradeService.addGradeToCollectionIfMissing(this.gradesSharedCollection, personne.grade);
    this.fonctionsSharedCollection = this.fonctionService.addFonctionToCollectionIfMissing(
      this.fonctionsSharedCollection,
      personne.fonction
    );
  }

  protected loadRelationshipsOptions(): void {
    this.affectationService
      .query()
      .pipe(map((res: HttpResponse<IAffectation[]>) => res.body ?? []))
      .pipe(
        map((affectations: IAffectation[]) =>
          this.affectationService.addAffectationToCollectionIfMissing(affectations, this.editForm.get('affectation')!.value)
        )
      )
      .subscribe((affectations: IAffectation[]) => (this.affectationsSharedCollection = affectations));

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
      fonction: this.editForm.get(['fonction'])!.value,
    };
  }
}
