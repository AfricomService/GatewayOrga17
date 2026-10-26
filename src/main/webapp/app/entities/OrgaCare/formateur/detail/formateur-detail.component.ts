import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { saveAs } from 'file-saver';
import { IFormateur } from '../formateur.model';
import { AccountService } from 'app/core/auth/account.service';
import { ThemeFormationService } from 'app/entities/OrgaCare/theme-formation/service/theme-formation.service';
import { IPieceJointe } from 'app/entities/OrgaCare/piece-jointe/piece-jointe.model';
import { PieceJointeService } from 'app/entities/OrgaCare/piece-jointe/service/piece-jointe.service';

@Component({
  selector: 'jhi-formateur-detail',
  templateUrl: './formateur-detail.component.html',
  styleUrls: ['./formateur-detail.component.scss'],
})
export class FormateurDetailComponent implements OnInit {
  formateur: IFormateur | null = null;
  canEdit = false;
  themeLabel: string | null = null;

  // Accordion
  sectionIdentite = true;
  sectionFormation = true;
  sectionPj = true;

  pieceJointes: IPieceJointe[] = [];
  loadingPieceJointes = false;
  selectedPjForPreview: IPieceJointe | null = null;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected accountService: AccountService,
    protected themeFormationService: ThemeFormationService,
    protected pieceJointeService: PieceJointeService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ formateur }) => {
      this.formateur = formateur;
      this.themeLabel = null;
      if (formateur?.themeId) {
        this.themeFormationService.find(formateur.themeId).subscribe(res => {
          this.themeLabel = res.body?.theme ?? null;
        });
      }
      if (formateur?.id) {
        this.loadPieceJointes(formateur.id);
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

  protected loadPieceJointes(formateurId: number): void {
    this.loadingPieceJointes = true;
    this.pieceJointeService.findByFormateur(formateurId).subscribe({
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
