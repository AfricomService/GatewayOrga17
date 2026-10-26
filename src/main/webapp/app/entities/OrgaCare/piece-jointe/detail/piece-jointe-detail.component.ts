import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPieceJointe } from '../piece-jointe.model';

@Component({
  selector: 'jhi-piece-jointe-detail',
  templateUrl: './piece-jointe-detail.component.html',
})
export class PieceJointeDetailComponent implements OnInit {
  pieceJointe: IPieceJointe | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceJointe }) => {
      this.pieceJointe = pieceJointe;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
