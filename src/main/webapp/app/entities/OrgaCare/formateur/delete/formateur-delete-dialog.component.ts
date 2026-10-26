import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormateur } from '../formateur.model';
import { FormateurService } from '../service/formateur.service';

@Component({
  templateUrl: './formateur-delete-dialog.component.html',
})
export class FormateurDeleteDialogComponent {
  formateur?: IFormateur;

  constructor(protected formateurService: FormateurService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.formateurService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
