import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormation } from '../formation.model';
import { FormationService } from '../service/formation.service';

@Component({
  templateUrl: './formation-delete-dialog.component.html',
})
export class FormationDeleteDialogComponent {
  formation?: IFormation;

  constructor(protected formationService: FormationService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.formationService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
