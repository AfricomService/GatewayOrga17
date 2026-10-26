import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITypeContrat } from '../type-contrat.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-type-contrat-detail',
  templateUrl: './type-contrat-detail.component.html',
  styleUrls: ['./type-contrat-detail.component.scss'],
})
export class TypeContratDetailComponent implements OnInit {
  typeContrat: ITypeContrat | null = null;
  canEdit = false;

  // Section Générale ouverte par défaut
  sectionGenerale = true;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ typeContrat }) => {
      this.typeContrat = typeContrat;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
