import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFonction } from '../fonction.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-fonction-detail',
  templateUrl: './fonction-detail.component.html',
  styleUrls: ['./fonction-detail.component.scss'],
})
export class FonctionDetailComponent implements OnInit {
  fonction: IFonction | null = null;
  canEdit = false;

  // Section Générale ouverte par défaut
  sectionGenerale = true;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ fonction }) => {
      this.fonction = fonction;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
