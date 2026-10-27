import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ISalaire } from '../salaire.model';
import { SalaireService } from '../service/salaire.service';

@Component({
  templateUrl: './salaire-delete-dialog.component.html',
})
export class SalaireDeleteDialogComponent {
  salaire?: ISalaire;

  constructor(protected salaireService: SalaireService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.salaireService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
