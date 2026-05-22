import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IContrat } from '../contrat.model';
import { ContratService } from '../service/contrat.service';

@Component({
  templateUrl: './contrat-delete-dialog.component.html',
})
export class ContratDeleteDialogComponent {
  contrat?: IContrat;

  constructor(protected contratService: ContratService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.contratService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
