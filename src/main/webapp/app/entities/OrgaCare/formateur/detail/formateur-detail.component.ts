import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFormateur } from '../formateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';

@Component({
  selector: 'jhi-formateur-detail',
  templateUrl: './formateur-detail.component.html',
  styleUrls: ['./formateur-detail.component.scss'],
})
export class FormateurDetailComponent implements OnInit {
  formateur: IFormateur | null = null;
  canEdit = false;
  themeLabel: string | null = null;

  // Accordion
  sectionIdentite = true;
  sectionFormation = true;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected themeFormationService: ThemeFormationService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ formateur }) => {
      this.formateur = formateur;
      this.themeLabel = null;
      if (formateur?.themeId) {
        this.themeFormationService.find(formateur.themeId).subscribe(res => {
          this.themeLabel = res.body?.theme ?? null;
        });
      }
    });
  }

  previousState(): void {
    window.history.back();
  }
}
