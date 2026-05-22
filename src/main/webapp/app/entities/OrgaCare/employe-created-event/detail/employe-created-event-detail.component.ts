import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IEmployeCreatedEvent } from '../employe-created-event.model';

@Component({
  selector: 'jhi-employe-created-event-detail',
  templateUrl: './employe-created-event-detail.component.html',
})
export class EmployeCreatedEventDetailComponent implements OnInit {
  employeCreatedEvent: IEmployeCreatedEvent | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ employeCreatedEvent }) => {
      this.employeCreatedEvent = employeCreatedEvent;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
