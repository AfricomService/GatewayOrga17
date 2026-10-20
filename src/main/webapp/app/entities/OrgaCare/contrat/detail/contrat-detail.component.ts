import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IContrat } from '../contrat.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-contrat-detail',
  templateUrl: './contrat-detail.component.html',
  styleUrls: ['./contrat-detail.component.scss'],
})
export class ContratDetailComponent implements OnInit {
  contrat: IContrat | null = null;

  canEdit = false;

  // ── État des accordéons (ouverts par défaut, comme l'écran d'édition) ──
  isPersonneSectionOpen = true;
  isDetailsSectionOpen = true;

  constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);

    this.activatedRoute.data.subscribe(({ contrat }) => {
      this.contrat = contrat;
    });
  }

  previousState(): void {
    window.history.back();
  }

  goToEdit(): void {
    if (this.contrat?.id !== undefined) {
      this.router.navigate(['/contrat', this.contrat.id, 'edit']);
    }
  }

  togglePersonneSection(): void {
    this.isPersonneSectionOpen = !this.isPersonneSectionOpen;
  }

  toggleDetailsSection(): void {
    this.isDetailsSectionOpen = !this.isDetailsSectionOpen;
  }

  get personneLabel(): string {
    const p = this.contrat?.personne;
    return p ? p.nomPrenom ?? `#${p.id ?? ''}` : '';
  }
}
