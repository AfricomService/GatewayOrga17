import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IThemeFormation, ThemeFormation } from '../theme-formation.model';
import { ThemeFormationService } from '../service/theme-formation.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-theme-formation-update',
  templateUrl: './theme-formation-update.component.html',
  styleUrls: ['./theme-formation-update.component.scss'],
})
export class ThemeFormationUpdateComponent implements OnInit {
  isSaving = false;

  // Valeurs autorisées pour le champ statut du thème (seulement 2)
  statusOptions: { value: string; label: string }[] = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
  ];

  // Accordion
  sectionInfo = true;
  sectionCout = true;

  editForm = this.fb.group({
    id: [],
    theme: [null, [Validators.required]],
    cout: [null, [Validators.min(0)]],
    duree_validite_certificat: [null, [Validators.min(0)]],
    notifier_expiration_avant: [null, [Validators.min(0)]],
    duree_anticipation_utilisateur: [null, [Validators.min(0)]],
    cout_formation_individuelle: [null, [Validators.min(0)]],
    status: [Etat.ACTIF],
    comments: [],
  });

  constructor(
    protected themeFormationService: ThemeFormationService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ themeFormation }) => {
      this.updateForm(themeFormation);
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const themeFormation = this.createFromForm();
    if (themeFormation.id !== undefined) {
      this.subscribeToSaveResponse(this.themeFormationService.update(themeFormation));
    } else {
      this.subscribeToSaveResponse(this.themeFormationService.create(themeFormation));
    }
  }

  // Aide template : champ invalide et touché
  hasError(controlName: string, error?: string): boolean {
    const control = this.editForm.get(controlName);
    if (!control || !(control.dirty || control.touched)) {
      return false;
    }
    return error ? !!control.errors?.[error] : control.invalid;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IThemeFormation>>): void {
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

  protected updateForm(themeFormation: IThemeFormation): void {
    this.editForm.patchValue({
      id: themeFormation.id,
      theme: themeFormation.theme,
      cout: themeFormation.cout,
      duree_validite_certificat: themeFormation.duree_validite_certificat,
      notifier_expiration_avant: themeFormation.notifier_expiration_avant,
      duree_anticipation_utilisateur: themeFormation.duree_anticipation_utilisateur,
      cout_formation_individuelle: themeFormation.cout_formation_individuelle,
      status: themeFormation.status ?? Etat.ACTIF,
      comments: themeFormation.comments,
    });
  }

  protected createFromForm(): IThemeFormation {
    return {
      ...new ThemeFormation(),
      id: this.editForm.get(['id'])!.value,
      theme: this.editForm.get(['theme'])!.value,
      cout: this.editForm.get(['cout'])!.value,
      duree_validite_certificat: this.editForm.get(['duree_validite_certificat'])!.value,
      notifier_expiration_avant: this.editForm.get(['notifier_expiration_avant'])!.value,
      duree_anticipation_utilisateur: this.editForm.get(['duree_anticipation_utilisateur'])!.value,
      cout_formation_individuelle: this.editForm.get(['cout_formation_individuelle'])!.value,
      status: this.editForm.get(['status'])!.value ?? Etat.ACTIF,
      comments: this.editForm.get(['comments'])!.value,
    };
  }
}
