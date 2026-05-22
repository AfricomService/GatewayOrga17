import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IStatusHistory } from '../status-history.model';
import { StatusHistoryService } from '../service/status-history.service';

@Component({
  templateUrl: './status-history-delete-dialog.component.html',
})
export class StatusHistoryDeleteDialogComponent {
  statusHistory?: IStatusHistory;

  constructor(protected statusHistoryService: StatusHistoryService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.statusHistoryService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
