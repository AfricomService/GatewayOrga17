import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IThemeFormation } from '../theme-formation.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-theme-formation-detail',
  templateUrl: './theme-formation-detail.component.html',
  styleUrls: ['./theme-formation-detail.component.scss'],
})
export class ThemeFormationDetailComponent implements OnInit {
  themeFormation: IThemeFormation | null = null;
  canEdit = false;

  // Accordion
  sectionInfo = true;
  sectionCout = true;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ themeFormation }) => {
      this.themeFormation = themeFormation;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
