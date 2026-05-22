import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStatusHistory } from '../status-history.model';

@Component({
  selector: 'jhi-status-history-detail',
  templateUrl: './status-history-detail.component.html',
})
export class StatusHistoryDetailComponent implements OnInit {
  statusHistory: IStatusHistory | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ statusHistory }) => {
      this.statusHistory = statusHistory;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
