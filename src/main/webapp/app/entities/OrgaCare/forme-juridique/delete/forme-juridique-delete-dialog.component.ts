import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IFormeJuridique } from '../forme-juridique.model';
import { FormeJuridiqueService } from '../service/forme-juridique.service';

@Component({
  templateUrl: './forme-juridique-delete-dialog.component.html',
})
export class FormeJuridiqueDeleteDialogComponent {
  formeJuridique?: IFormeJuridique;

  constructor(protected formeJuridiqueService: FormeJuridiqueService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.formeJuridiqueService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
