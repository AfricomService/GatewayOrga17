import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPieceJointe } from '../piece-jointe.model';
import { PieceJointeService } from '../service/piece-jointe.service';
import { PieceJointeDeleteDialogComponent } from '../delete/piece-jointe-delete-dialog.component';

@Component({
  selector: 'jhi-piece-jointe',
  templateUrl: './piece-jointe.component.html',
})
export class PieceJointeComponent implements OnInit {
  pieceJointes?: IPieceJointe[];
  isLoading = false;

  constructor(protected pieceJointeService: PieceJointeService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.pieceJointeService.query().subscribe(
      (res: HttpResponse<IPieceJointe[]>) => {
        this.isLoading = false;
        this.pieceJointes = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IPieceJointe): number {
    return item.id!;
  }

  delete(pieceJointe: IPieceJointe): void {
    const modalRef = this.modalService.open(PieceJointeDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.pieceJointe = pieceJointe;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
