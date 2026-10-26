import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { saveAs } from 'file-saver';
import { IFormation } from '../formation.model';
import { AccountService } from 'app/core/auth/account.service';
import { SessionFormationService } from 'app/entities/OrgaCare/session-formation/service/session-formation.service';
import { IPieceJointe } from 'app/entities/OrgaCare/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/OrgaCare/piece-jointe/service/piece-jointe.service';

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
  sectionPj = true;

  sessionLabel: string | null = null;

  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  selectedPjForPreview: IPieceJointe | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected sessionFormationService: SessionFormationService,
    protected pieceJointeService: PieceJointeService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ formation }) => {
      this.formation = formation;
      this.resolveSession();
      this.selectedPjForPreview = null;
      if (formation?.id) {
        this.loadPieceJointes(formation.id);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  trackPjById(index: number, item: IPieceJointe): number {
    return item.id!;
  }

  pjFullName(pj: IPieceJointe): string {
    return `${pj.nomFichier ?? ''}${pj.type ? '.' + pj.type : ''}`;
  }

  togglePjPreview(pj: IPieceJointe): void {
    this.selectedPjForPreview = this.selectedPjForPreview?.id === pj.id ? null : pj;
  }

  closePjPreview(): void {
    this.selectedPjForPreview = null;
  }

  downloadPieceJointe(pj: IPieceJointe): void {
    this.pieceJointeService.getFile(pj.id!).subscribe({
      next: (blob: Blob) => saveAs(blob, this.pjFullName(pj)),
      error(err) {
        console.error('Download failed', err);
        alert('Échec du téléchargement du fichier');
      },
    });
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

  protected loadPieceJointes(formationId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByFormation(formationId).subscribe({
      next: pjs => {
        this.pieceJointes = pjs;
        this.loadingPieceJointes = false;
      },
      error: () => {
        this.pieceJointes = [];
        this.loadingPieceJointes = false;
      },
    });
  }
}
