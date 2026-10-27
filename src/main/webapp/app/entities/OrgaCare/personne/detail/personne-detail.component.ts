import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { IPersonne } from '../personne.model';
import { AccountService } from 'app/core/auth/account.service';
import { IAffectation } from 'app/entities/OrgaCare/affectation/affectation.model';
import { AffectationService } from 'app/entities/OrgaCare/affectation/service/affectation.service';
import { IContrat } from 'app/entities/OrgaCare/contrat/contrat.model';
import { ContratService } from 'app/entities/OrgaCare/contrat/service/contrat.service';
import { IAbsence } from 'app/entities/OrgaCare/absence/absence.model';
import { AbsenceService } from 'app/entities/OrgaCare/absence/service/absence.service';
import { IGrade } from 'app/entities/OrgaCare/grade/grade.model';
import { GradeService } from 'app/entities/OrgaCare/grade/service/grade.service';
import { IFonction } from 'app/entities/OrgaCare/fonction/fonction.model';
import { FonctionService } from 'app/entities/OrgaCare/fonction/service/fonction.service';
import { ISalaire } from 'app/entities/OrgaCare/salaire/salaire.model';
import { SalaireService } from 'app/entities/OrgaCare/salaire/service/salaire.service';

@Component({
  selector: 'jhi-personne-detail',
  templateUrl: './personne-detail.component.html',
  styleUrls: ['./personne-detail.component.scss'],
})
export class PersonneDetailComponent implements OnInit {
  personne: IPersonne | null = null;

  canEdit = false;
  activePanels: string[] = ['panel-0'];

  grades: IGrade[] = [];
  fonctions: IFonction[] = [];

  affectationsPersonne: IAffectation[] = [];
  isLoadingAffectations = false;

  contratsPersonne: IContrat[] = [];
  isLoadingContrats = false;

  absencesPersonne: IAbsence[] = [];
  isLoadingAbsences = false;

  salairesPersonne: ISalaire[] = [];
  isLoadingSalaires = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected accountService: AccountService,
    protected affectationService: AffectationService,
    protected contratService: ContratService,
    protected absenceService: AbsenceService,
    protected gradeService: GradeService,
    protected fonctionService: FonctionService,
    protected salaireService: SalaireService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);

    this.activatedRoute.data.subscribe(({ personne }) => {
      this.personne = personne as IPersonne;
      this.loadGradesAndFonctions();
      if (this.personne.id !== undefined) {
        this.loadAffectations(this.personne.id);
        this.loadContrats(this.personne.id);
        this.loadAbsences(this.personne.id);
        this.loadSalaires(this.personne.id);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  goToEdit(): void {
    if (this.personne?.id !== undefined) {
      this.router.navigate(['/personne', this.personne.id, 'edit']);
    }
  }

  get gradeLabel(): string | null {
    const p = this.personne;
    if (!p) {
      return null;
    }
    const direct = p.grade?.label;
    if (direct) {
      return direct;
    }
    const found = this.grades.find(g => g.id === p.gradeId);
    return found?.label ?? null;
  }

  get fonctionLabel(): string | null {
    const p = this.personne;
    if (!p) {
      return null;
    }
    const direct = p.fonction?.label;
    if (direct) {
      return direct;
    }
    const found = this.fonctions.find(f => f.id === p.fonctionId);
    return found?.label ?? null;
  }

  hasAccount(): boolean {
    return this.personne?.userId != null && this.personne.userId !== '';
  }

  // Ouvre le département affecté (consultation ou édition selon le rôle)
  goToDepartement(aff: IAffectation): void {
    if (!aff.departementId) {
      return;
    }
    window.open(`/orga/departement/${aff.departementId}/${this.canEdit ? 'edit' : 'view'}`, '_blank');
  }

  protected loadGradesAndFonctions(): void {
    this.gradeService.query().subscribe({
      next: (res: HttpResponse<IGrade[]>) => (this.grades = res.body ?? []),
    });
    this.fonctionService.query().subscribe({
      next: (res: HttpResponse<IFonction[]>) => (this.fonctions = res.body ?? []),
    });
  }

  protected loadAffectations(personneId: number): void {
    this.isLoadingAffectations = true;
    this.affectationService.findAffectationsActivesByPersonneId(personneId).subscribe({
      next: (affectations: IAffectation[]) => {
        this.affectationsPersonne = affectations;
        this.isLoadingAffectations = false;
      },
      error: () => (this.isLoadingAffectations = false),
    });
  }

  protected loadContrats(personneId: number): void {
    this.isLoadingContrats = true;
    this.contratService.findByPersonneId(personneId).subscribe({
      next: (contrats: IContrat[]) => {
        this.contratsPersonne = contrats;
        this.isLoadingContrats = false;
      },
      error: () => (this.isLoadingContrats = false),
    });
  }

  protected loadAbsences(personneId: number): void {
    this.isLoadingAbsences = true;
    this.absenceService.findByPersonneAbscentId(personneId).subscribe({
      next: (absences: IAbsence[]) => {
        this.absencesPersonne = absences;
        this.isLoadingAbsences = false;
      },
      error: () => (this.isLoadingAbsences = false),
    });
  }

  protected loadSalaires(personneId: number): void {
    this.isLoadingSalaires = true;
    this.salaireService.findByPersonneId(personneId).subscribe({
      next: (salaires: ISalaire[]) => {
        this.salairesPersonne = salaires;
        this.isLoadingSalaires = false;
      },
      error: () => (this.isLoadingSalaires = false),
    });
  }
}
