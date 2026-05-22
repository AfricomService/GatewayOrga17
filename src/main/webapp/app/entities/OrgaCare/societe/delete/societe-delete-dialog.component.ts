import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ISociete } from '../societe.model';
import { SocieteService } from '../service/societe.service';

@Component({
  templateUrl: './societe-delete-dialog.component.html',
})
export class SocieteDeleteDialogComponent {
  societe?: ISociete;

  constructor(protected societeService: SocieteService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.societeService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
