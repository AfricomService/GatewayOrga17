import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFormeJuridique } from '../forme-juridique.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-forme-juridique-detail',
  templateUrl: './forme-juridique-detail.component.html',
  styleUrls: ['./forme-juridique-detail.component.scss'],
})
export class FormeJuridiqueDetailComponent implements OnInit {
  formeJuridique: IFormeJuridique | null = null;
  canEdit = false;

  // Section Générale ouverte par défaut
  sectionGenerale = true;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ formeJuridique }) => {
      this.formeJuridique = formeJuridique;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
