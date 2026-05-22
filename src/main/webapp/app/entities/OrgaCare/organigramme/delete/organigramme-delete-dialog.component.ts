import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IOrganigramme } from '../organigramme.model';
import { OrganigrammeService } from '../service/organigramme.service';

@Component({
  templateUrl: './organigramme-delete-dialog.component.html',
})
export class OrganigrammeDeleteDialogComponent {
  organigramme?: IOrganigramme;

  constructor(protected organigrammeService: OrganigrammeService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.organigrammeService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
