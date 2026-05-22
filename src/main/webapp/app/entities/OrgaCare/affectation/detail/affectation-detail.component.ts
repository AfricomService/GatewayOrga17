import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IAffectation } from '../affectation.model';

@Component({
  selector: 'jhi-affectation-detail',
  templateUrl: './affectation-detail.component.html',
})
export class AffectationDetailComponent implements OnInit {
  affectation: IAffectation | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ affectation }) => {
      this.affectation = affectation;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
