import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAbsence } from '../absence.model';

@Component({
  selector: 'jhi-absence-detail',
  templateUrl: './absence-detail.component.html',
})
export class AbsenceDetailComponent implements OnInit {
  absence: IAbsence | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ absence }) => {
      this.absence = absence;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
