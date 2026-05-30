import { Component, OnInit } from '@angular/core';
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

  constructor(
    protected personneService: PersonneService,
    protected affectationService: AffectationService,
    protected gradeService: GradeService,
    protected fonctionService: FonctionService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
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

      // Logique de génération automatique du matricule (conservée)
      if (this.generateMatriculeAutomatically && personne.id === undefined) {
        this.personneService.generateNextMatricule('Empl-').subscribe(nextCode => {
          this.editForm.get('matricule')?.setValue(nextCode);
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
      etat: personne.etat,
      etatContractuelle: personne.etatContractuelle,
      dateCreation: personne.dateCreation ? personne.dateCreation.format(DATE_TIME_FORMAT) : null,
      dateDebutContrat: personne.dateDebutContrat ? personne.dateDebutContrat.format(DATE_TIME_FORMAT) : null,
      idContratActif: personne.idContratActif,
      idTypeContratActif: personne.idTypeContratActif,
      userId: personne.userId,
      affectation: personne.affectation,
      grade: personne.grade,
      fonction: personne.fonction,
    });

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
