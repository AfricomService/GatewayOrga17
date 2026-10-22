import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISessionFormation } from '../session-formation.model';
import { AccountService } from 'app/core/auth/account.service';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';

@Component({
  selector: 'jhi-session-formation-detail',
  templateUrl: './session-formation-detail.component.html',
  styleUrls: ['./session-formation-detail.component.scss'],
})
export class SessionFormationDetailComponent implements OnInit {
  sessionFormation: ISessionFormation | null = null;
  canEdit = false;

  // Accordion : seul "Général" est ouvert au départ
  sectionGeneral = true;
  sectionPlanification = false;
  sectionBudget = false;

  themeLabel: string | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected themeFormationService: ThemeFormationService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ sessionFormation }) => {
      this.sessionFormation = sessionFormation;
      this.resolveTheme();
    });
  }

  previousState(): void {
    window.history.back();
  }

  protected resolveTheme(): void {
    this.themeLabel = null;
    const themeId = this.sessionFormation?.themeId;
    if (themeId === undefined || themeId === null) {
      return;
    }
    this.themeFormationService.find(themeId).subscribe(res => {
      this.themeLabel = res.body?.theme ?? String(themeId);
    });
  }
}
