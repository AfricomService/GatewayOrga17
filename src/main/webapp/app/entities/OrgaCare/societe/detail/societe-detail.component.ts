import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ISociete } from '../societe.model';
import { DataUtils } from 'app/core/util/data-util.service';
import { AccountService } from 'app/core/auth/account.service';
import { IFormeJuridique } from 'app/entities/OrgaCare/forme-juridique/forme-juridique.model';
import { FormeJuridiqueService } from 'app/entities/OrgaCare/forme-juridique/service/forme-juridique.service';

@Component({
  selector: 'jhi-societe-detail',
  templateUrl: './societe-detail.component.html',
  styleUrls: ['./societe-detail.component.scss'],
})
export class SocieteDetailComponent implements OnInit {
  societe: ISociete | null = null;
  canEdit = false;
  formeJuridiqueNom: string | null = null;

  SocieteItems = ['Section Générale', 'Section Communication', 'Section Médias'];
  activePanels: string[] = ['panel-0'];

  constructor(
    protected dataUtils: DataUtils,
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected formeJuridiqueService: FormeJuridiqueService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ societe }) => {
      this.societe = societe;
      this.resolveFormeJuridique();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    window.history.back();
  }

  togglePanel(item: string): void {
    const panelId = `panel-${this.SocieteItems.indexOf(item)}`;
    const index = this.activePanels.indexOf(panelId);
    if (index > -1) {
      this.activePanels.splice(index, 1);
    } else {
      this.activePanels.push(panelId);
    }
  }

  isPanelOpen(item: string): boolean {
    const panelId = `panel-${this.SocieteItems.indexOf(item)}`;
    return this.activePanels.includes(panelId);
  }

  protected resolveFormeJuridique(): void {
    const societe = this.societe;
    if (!societe) {
      this.formeJuridiqueNom = null;
      return;
    }
    if (societe.formeJuridiquee?.nom) {
      this.formeJuridiqueNom = societe.formeJuridiquee.nom;
      return;
    }
    if (societe.formeJuridiqueeId) {
      this.formeJuridiqueService.query().subscribe((res: HttpResponse<IFormeJuridique[]>) => {
        const found = (res.body ?? []).find(fj => fj.id === societe.formeJuridiqueeId);
        this.formeJuridiqueNom = found?.nom ?? null;
      });
    } else {
      this.formeJuridiqueNom = null;
    }
  }
}
