import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IEmployeCreatedEvent } from '../employe-created-event.model';
import { EmployeCreatedEventService } from '../service/employe-created-event.service';

@Component({
  templateUrl: './employe-created-event-delete-dialog.component.html',
})
export class EmployeCreatedEventDeleteDialogComponent {
  employeCreatedEvent?: IEmployeCreatedEvent;

  constructor(protected employeCreatedEventService: EmployeCreatedEventService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.employeCreatedEventService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
