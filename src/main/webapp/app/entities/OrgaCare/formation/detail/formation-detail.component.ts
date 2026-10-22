import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFormation } from '../formation.model';
import { AccountService } from 'app/core/auth/account.service';
import { SessionFormationService } from 'app/entities/OrgaCare/session-formation/service/session-formation.service';

@Component({
  selector: 'jhi-formation-detail',
  templateUrl: './formation-detail.component.html',
  styleUrls: ['./formation-detail.component.scss'],
})
export class FormationDetailComponent implements OnInit {
  formation: IFormation | null = null;
  canEdit = false;

  // Accordion : seul "Général" est ouvert au départ
  sectionGeneral = true;
  sectionCertificat = false;

  sessionLabel: string | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected sessionFormationService: SessionFormationService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ formation }) => {
      this.formation = formation;
      this.resolveSession();
    });
  }

  previousState(): void {
    window.history.back();
  }

  protected resolveSession(): void {
    this.sessionLabel = null;
    const sessionId = this.formation?.sessionId;
    if (sessionId === undefined || sessionId === null) {
      return;
    }
    this.sessionFormationService.find(sessionId).subscribe(res => {
      this.sessionLabel = res.body?.title ?? String(sessionId);
    });
  }
}
