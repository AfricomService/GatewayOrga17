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

  // Affectations par type (pour le panel Membres)
  chefs: IPersonne[] = [];
  assistants: IPersonne[] = [];
  membres: IPersonne[] = [];
  interims: IPersonne[] = [];

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
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ departement }) => {
      this.updateForm(departement);
      this.loadRelationshipsOptions();

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

  getPersonnesLabel(personnes: IPersonne[]): string {
    return personnes.map(p => p.nomPrenom ?? p.id).join(', ');
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
      organigramme: departement.organigramme,
      departementParent: departement.departementParent,
      personnes: departement.personnes,
    });

    // Société depuis l'organigramme
    this.societeRaisonSociale = departement.organigramme?.societeRaisonSociale ?? null;

    // Répartir les personnes par type d'affectation
    // (si votre backend renvoie les affectations typées, adaptez ici)
    this.membres = departement.personnes ?? [];

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
    return {
      ...new Departement(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value,
      nom: this.editForm.get(['nom'])!.value,
      status: this.editForm.get(['status'])!.value ?? Etat.ACTIF,
      email: this.editForm.get(['email'])!.value,
      organigramme: this.editForm.get(['organigramme'])!.value,
      departementParent: this.editForm.get(['departementParent'])!.value,
      personnes: this.editForm.get(['personnes'])!.value,
    };
  }
}
