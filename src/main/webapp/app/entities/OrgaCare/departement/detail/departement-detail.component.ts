import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IDepartement } from '../departement.model';
import { AccountService } from 'app/core/auth/account.service';
import { DepartementService } from '../service/departement.service';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';
import { AffectationService, IPersonneAffectationDTO } from 'app/entities/OrgaCare/affectation/service/affectation.service';

@Component({
  selector: 'jhi-departement-detail',
  templateUrl: './departement-detail.component.html',
  styleUrls: ['./departement-detail.component.scss'],
})
export class DepartementDetailComponent implements OnInit {
  departement: IDepartement | null = null;
  canEdit = false;

  // Accordion : seul "Détails" est ouvert au départ
  sectionDetails = true;
  sectionHierarchie = false;
  sectionMembres = false;

  organigrammeLabel: string | null = null;
  societeRaisonSociale: string | null = null;
  parentLabel: string | null = null;

  chefs: IPersonneAffectationDTO[] = [];
  assistants: IPersonneAffectationDTO[] = [];
  membres: IPersonneAffectationDTO[] = [];
  interims: IPersonneAffectationDTO[] = [];

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected departementService: DepartementService,
    protected organigrammeService: OrganigrammeService,
    protected affectationService: AffectationService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ departement }) => {
      this.departement = departement;
      this.resolveRelations();
      if (departement?.id) {
        this.loadPersonnes(departement.id);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  getPersonnesLabel(personnes: IPersonneAffectationDTO[]): string {
    return personnes.map(p => p.nomPrenom || p.matricule || String(p.personneId)).join(', ');
  }

  protected resolveRelations(): void {
    const dep = this.departement;
    if (!dep) {
      return;
    }

    // Organigramme + société
    const orga = dep.organigramme;
    this.organigrammeLabel = dep.organigrammeNom ?? orga?.nom ?? orga?.code ?? (orga?.id ? String(orga.id) : null);
    this.societeRaisonSociale = dep.societeRaisonSociale ?? orga?.societeRaisonSociale ?? null;

    if (!orga && dep.organigrammeId && (!this.organigrammeLabel || !this.societeRaisonSociale)) {
      this.organigrammeService.find(dep.organigrammeId).subscribe(res => {
        const o = res.body;
        if (o) {
          this.organigrammeLabel = this.organigrammeLabel ?? o.nom ?? o.code ?? String(o.id);
          this.societeRaisonSociale = this.societeRaisonSociale ?? o.societeRaisonSociale ?? null;
        }
      });
    }

    // Département parent
    const parent = dep.departementParent;
    this.parentLabel = parent?.nom ?? parent?.code ?? null;
    if (!parent && dep.departementParentId) {
      this.departementService.find(dep.departementParentId).subscribe(res => {
        const p = res.body;
        this.parentLabel = p?.nom ?? p?.code ?? null;
      });
    }
  }

  protected loadPersonnes(departementId: number): void {
    this.affectationService.findPersonnesByDepartementId(departementId).subscribe({
      next: (personnes: IPersonneAffectationDTO[]) => {
        this.chefs = personnes.filter(p => p.typeAffectation === 'CHEF');
        this.assistants = personnes.filter(p => p.typeAffectation === 'ASSISTANT');
        this.membres = personnes.filter(p => p.typeAffectation === 'MEMBRE');
        this.interims = personnes.filter(p => p.typeAffectation === 'INTERIM');
      },
      error: () => {
        this.chefs = [];
        this.assistants = [];
        this.membres = [];
        this.interims = [];
      },
    });
  }
}
