import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAbsence } from '../absence.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-absence-detail',
  templateUrl: './absence-detail.component.html',
  styleUrls: ['./absence-detail.component.scss'],
})
export class AbsenceDetailComponent implements OnInit {
  absence: IAbsence | null = null;
  canEdit = false;

  // Section Générale ouverte par défaut
  sectionGenerale = true;
  sectionPersonnes = false;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ absence }) => {
      this.absence = absence;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
