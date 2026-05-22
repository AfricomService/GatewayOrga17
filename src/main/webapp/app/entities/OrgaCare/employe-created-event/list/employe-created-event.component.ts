import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IEmployeCreatedEvent } from '../employe-created-event.model';
import { EmployeCreatedEventService } from '../service/employe-created-event.service';
import { EmployeCreatedEventDeleteDialogComponent } from '../delete/employe-created-event-delete-dialog.component';

@Component({
  selector: 'jhi-employe-created-event',
  templateUrl: './employe-created-event.component.html',
})
export class EmployeCreatedEventComponent implements OnInit {
  employeCreatedEvents?: IEmployeCreatedEvent[];
  isLoading = false;

  constructor(protected employeCreatedEventService: EmployeCreatedEventService, protected modalService: NgbModal) {}

  loadAll(): void {
    this.isLoading = true;

    this.employeCreatedEventService.query().subscribe(
      (res: HttpResponse<IEmployeCreatedEvent[]>) => {
        this.isLoading = false;
        this.employeCreatedEvents = res.body ?? [];
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnInit(): void {
    this.loadAll();
  }

  trackId(index: number, item: IEmployeCreatedEvent): number {
    return item.id!;
  }

  delete(employeCreatedEvent: IEmployeCreatedEvent): void {
    const modalRef = this.modalService.open(EmployeCreatedEventDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.employeCreatedEvent = employeCreatedEvent;
    // unsubscribe not needed because closed completes on modal close
    modalRef.closed.subscribe(reason => {
      if (reason === 'deleted') {
        this.loadAll();
      }
    });
  }
}
