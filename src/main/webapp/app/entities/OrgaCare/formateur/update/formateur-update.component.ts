import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IFormateur, Formateur } from '../formateur.model';
import { FormateurService } from '../service/formateur.service';
import { IThemeFormation } from 'app/entities/OrgaCare/theme-formation/theme-formation.model';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-formateur-update',
  templateUrl: './formateur-update.component.html',
  styleUrls: ['./formateur-update.component.scss'],
})
export class FormateurUpdateComponent implements OnInit {
  isSaving = false;

  // Valeurs autorisées pour le champ statut du formateur (seulement 2)
  statusOptions: { value: string; label: string }[] = [
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
  ];

  // Liste des thèmes pour le select
  themesCollection: IThemeFormation[] = [];

  // Accordion
  sectionIdentite = true;
  sectionFormation = true;

  editForm = this.fb.group({
    id: [],
    nomPrenom: [null, [Validators.required]],
    cin: [],
    email: [null, [Validators.email]],
    telephone: [],
    status: [Etat.ACTIF],
    comments: [],
    themeId: [null],
  });

  constructor(
    protected formateurService: FormateurService,
    protected themeFormationService: ThemeFormationService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ formateur }) => {
      this.updateForm(formateur);
      this.loadThemes();
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
    const formateur = this.createFromForm();
    if (formateur.id !== undefined) {
      this.subscribeToSaveResponse(this.formateurService.update(formateur));
    } else {
      this.subscribeToSaveResponse(this.formateurService.create(formateur));
    }
  }

  trackThemeById(index: number, item: IThemeFormation): number {
    return item.id!;
  }

  // Aide template : champ invalide et touché
  hasError(controlName: string, error?: string): boolean {
    const control = this.editForm.get(controlName);
    if (!control || !(control.dirty || control.touched)) {
      return false;
    }
    return error ? !!control.errors?.[error] : control.invalid;
  }

  protected loadThemes(): void {
    this.themeFormationService.query().subscribe((res: HttpResponse<IThemeFormation[]>) => {
      this.themesCollection = res.body ?? [];
    });
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFormateur>>): void {
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

  protected updateForm(formateur: IFormateur): void {
    this.editForm.patchValue({
      id: formateur.id,
      nomPrenom: formateur.nomPrenom,
      cin: formateur.cin,
      email: formateur.email,
      telephone: formateur.telephone,
      status: formateur.status ?? Etat.ACTIF,
      comments: formateur.comments,
      themeId: formateur.themeId ?? null,
    });
  }

  protected createFromForm(): IFormateur {
    return {
      ...new Formateur(),
      id: this.editForm.get(['id'])!.value,
      nomPrenom: this.editForm.get(['nomPrenom'])!.value,
      cin: this.editForm.get(['cin'])!.value,
      email: this.editForm.get(['email'])!.value,
      telephone: this.editForm.get(['telephone'])!.value,
      status: this.editForm.get(['status'])!.value ?? Etat.ACTIF,
      comments: this.editForm.get(['comments'])!.value,
      themeId: this.editForm.get(['themeId'])!.value,
    };
  }
}
