import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IPersonne } from '../personne.model';
import { PersonneService } from '../service/personne.service';

@Component({
  templateUrl: './personne-delete-dialog.component.html',
})
export class PersonneDeleteDialogComponent {
  personne?: IPersonne;

  constructor(protected personneService: PersonneService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.personneService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
