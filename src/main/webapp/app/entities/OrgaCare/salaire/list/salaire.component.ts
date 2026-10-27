import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ISalaire } from '../salaire.model';
import { SalaireService } from '../service/salaire.service';
import { SalaireDeleteDialogComponent } from '../delete/salaire-delete-dialog.component';

@Component({
  selector: 'jhi-salaire',
  templateUrl: './salaire.component.html',
})
export class SalaireComponent implements OnInit {
  salaires?: ISalaire[];
  isLoading = false;

  constructor(protected salaireService: SalaireService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.salaireService.query().subscribe(
      (res: HttpResponse<ISalaire[]>) => {
        this.isLoading = false;
        this.salaires = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: ISalaire): number {
    return item.id!;
  }

  delete(salaire: ISalaire): void {
    const modalRef = this.modalService.open(SalaireDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.salaire = salaire;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
