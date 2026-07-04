import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IDepartement, Departement } from '../departement.model';
import { DepartementService } from '../service/departement.service';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneService } from 'app/entities/OrgaCare/personne/service/personne.service';
import { Etat } from 'app/entities/enumerations/etat.model';
import { AffectationService, IPersonneAffectationDTO } from 'app/entities/OrgaCare/affectation/service/affectation.service';

@Component({
  selector: 'jhi-departement-update',
  templateUrl: './departement-update.component.html',
  styleUrls: ['./departement-update.component.scss'],
})
export class DepartementUpdateComponent implements OnInit {
  isSaving = false;

  // Enum exposé au template (pattern JHipster 7)
  etatValues = Object.keys(Etat);

  // Collections pour les selects
  organigrammesSharedCollection: IOrganigramme[] = [];
  departementsSharedCollection: IDepartement[] = [];
  personnesSharedCollection: IPersonne[] = [];

  // Accordion
  activePanels: string[] = ['panel-0'];

  // Affectations par type (pour le panel Membres) — alimentées via AffectationService
  chefs: IPersonneAffectationDTO[] = [];
  assistants: IPersonneAffectationDTO[] = [];
  membres: IPersonneAffectationDTO[] = [];
  interims: IPersonneAffectationDTO[] = [];

  // Société affichée (lue depuis l'organigramme sélectionné)
  societeRaisonSociale: string | null = null;

  generateCodeAutomatically = false;

  editForm = this.fb.group({
    id: [],
    code: [],
    nom: [],
    status: [Etat.ACTIF], // valeur par défaut ACTIF
    email: [null],
    organigramme: [],
    departementParent: [],
    personnes: [],
  });

  constructor(
    protected departementService: DepartementService,
    protected organigrammeService: OrganigrammeService,
    protected personneService: PersonneService,
    protected affectationService: AffectationService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ departement }) => {
      this.updateForm(departement);
      this.loadRelationshipsOptions();
      this.editForm.get('departementParent')!.disable();

      // NOUVEAU : chargement des membres réels via l'API, uniquement en mode édition
      if (departement.id) {
        this.loadPersonnesByDepartement(departement.id);
      }

      if (this.generateCodeAutomatically && departement.id === undefined) {
        this.departementService.generateNextCode('DEPT-').subscribe(nextCode => {
          this.editForm.get('code')?.setValue(nextCode);
        });
      }

      // Écouter les changements d'organigramme pour mettre à jour la société
      this.editForm.get('organigramme')!.valueChanges.subscribe((orga: IOrganigramme | null) => {
        this.societeRaisonSociale = orga?.societeRaisonSociale ?? null;
      });
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const departement = this.createFromForm();
    if (departement.id !== undefined) {
      this.subscribeToSaveResponse(this.departementService.update(departement));
    } else {
      this.subscribeToSaveResponse(this.departementService.create(departement));
    }
  }

  // ── TrackBy ──────────────────────────────────────────────────────────────

  trackOrganigrammeById(index: number, item: IOrganigramme): number {
    return item.id!;
  }

  trackDepartementById(index: number, item: IDepartement): number {
    return item.id!;
  }

  trackPersonneById(index: number, item: IPersonne): number {
    return item.id!;
  }

  // ── Sélection multiple (logique conservée + modernisée) ──────────────────

  getSelectedPersonne(option: IPersonne, selectedVals?: IPersonne[]): IPersonne {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  // ── Gestion des membres par type ─────────────────────────────────────────

  openModifierPersonnes(type: 'CHEF' | 'ASSISTANT' | 'MEMBRE' | 'INTERIM'): void {
    // Hook à brancher sur votre modal/page d'affectation
    // Exemple : this.router.navigate(['/affectation/new'], { queryParams: { type, departementId: this.editForm.get('id')!.value } });
  }

  // ── Chargement des membres réels via AffectationService ───────────────────

  protected loadPersonnesByDepartement(departementId: number): void {
    this.affectationService.findPersonnesByDepartementId(departementId).subscribe({
      next: (personnes: IPersonneAffectationDTO[]) => {
        this.chefs = personnes.filter(p => p.typeAffectation === 'CHEF');
        this.assistants = personnes.filter(p => p.typeAffectation === 'ASSISTANT');
        this.membres = personnes.filter(p => p.typeAffectation === 'MEMBRE');
        this.interims = personnes.filter(p => p.typeAffectation === 'INTERIM');
      },
      error: () => {
        // Optionnel : afficher une alerte d'erreur
        this.chefs = [];
        this.assistants = [];
        this.membres = [];
        this.interims = [];
      },
    });
  }

  getPersonnesLabel(personnes: IPersonneAffectationDTO[]): string {
    return personnes.map(p => p.nomPrenom ?? p.matricule ?? p.personneId).join(', ');
  }

  // ── Save helpers ─────────────────────────────────────────────────────────

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDepartement>>): void {
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

  // ── Form ─────────────────────────────────────────────────────────────────

  protected updateForm(departement: IDepartement): void {
    this.editForm.patchValue({
      id: departement.id,
      code: departement.code,
      nom: departement.nom,
      status: departement.status ?? Etat.ACTIF,
      email: departement.email,
      organigramme: departement.organigramme ?? null,
      departementParent: departement.departementParent ?? null,
      personnes: departement.personnes,
    });

    this.organigrammesSharedCollection = this.organigrammeService.addOrganigrammeToCollectionIfMissing(
      this.organigrammesSharedCollection,
      departement.organigramme
    );
    this.departementsSharedCollection = this.departementService.addDepartementToCollectionIfMissing(
      this.departementsSharedCollection,
      departement.departementParent
    );
    this.personnesSharedCollection = this.personneService.addPersonneToCollectionIfMissing(
      this.personnesSharedCollection,
      ...(departement.personnes ?? [])
    );

    // Si organigramme est null mais organigrammeId est présent → charger depuis l'API
    if (!departement.organigramme && departement.organigrammeId) {
      this.organigrammeService.find(departement.organigrammeId).subscribe(res => {
        const orga = res.body;
        if (orga) {
          this.organigrammesSharedCollection = this.organigrammeService.addOrganigrammeToCollectionIfMissing(
            this.organigrammesSharedCollection,
            orga
          );
          this.editForm.patchValue({ organigramme: orga });
          this.societeRaisonSociale = orga.societeRaisonSociale ?? null;
        }
      });
    } else {
      this.societeRaisonSociale = departement.organigramme?.societeRaisonSociale ?? null;
    }

    // Si departementParent est null mais departementParentId est présent → charger depuis l'API
    if (!departement.departementParent && departement.departementParentId) {
      this.departementService.find(departement.departementParentId).subscribe(res => {
        const parent = res.body;
        if (parent) {
          this.departementsSharedCollection = this.departementService.addDepartementToCollectionIfMissing(
            this.departementsSharedCollection,
            parent
          );
          this.editForm.patchValue({ departementParent: parent });
        }
      });
    }
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

    this.departementService
      .query()
      .pipe(map((res: HttpResponse<IDepartement[]>) => res.body ?? []))
      .pipe(
        map((departements: IDepartement[]) =>
          this.departementService.addDepartementToCollectionIfMissing(departements, this.editForm.get('departementParent')!.value)
        )
      )
      .subscribe((departements: IDepartement[]) => (this.departementsSharedCollection = departements));

    this.personneService
      .query()
      .pipe(map((res: HttpResponse<IPersonne[]>) => res.body ?? []))
      .pipe(
        map((personnes: IPersonne[]) =>
          this.personneService.addPersonneToCollectionIfMissing(personnes, ...(this.editForm.get('personnes')!.value ?? []))
        )
      )
      .subscribe((personnes: IPersonne[]) => (this.personnesSharedCollection = personnes));
  }

  protected createFromForm(): IDepartement {
    const raw = this.editForm.getRawValue();
    return {
      ...new Departement(),
      id: raw.id,
      code: raw.code,
      nom: raw.nom,
      status: raw.status ?? Etat.ACTIF,
      email: raw.email,
      organigramme: raw.organigramme,
      departementParent: raw.departementParent,
      personnes: raw.personnes,
    };
  }
}
