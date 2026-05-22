import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IGroupe } from '../groupe.model';
import { GroupeService } from '../service/groupe.service';

@Component({
  templateUrl: './groupe-delete-dialog.component.html',
})
export class GroupeDeleteDialogComponent {
  groupe?: IGroupe;

  constructor(protected groupeService: GroupeService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.groupeService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
