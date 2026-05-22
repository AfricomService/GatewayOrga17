import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ITypeContrat } from '../type-contrat.model';
import { TypeContratService } from '../service/type-contrat.service';

@Component({
  templateUrl: './type-contrat-delete-dialog.component.html',
})
export class TypeContratDeleteDialogComponent {
  typeContrat?: ITypeContrat;

  constructor(protected typeContratService: TypeContratService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.typeContratService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
