import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ISessionFormation } from '../session-formation.model';
import { SessionFormationService } from '../service/session-formation.service';

@Component({
  templateUrl: './session-formation-delete-dialog.component.html',
})
export class SessionFormationDeleteDialogComponent {
  sessionFormation?: ISessionFormation;

  constructor(protected sessionFormationService: SessionFormationService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.sessionFormationService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
