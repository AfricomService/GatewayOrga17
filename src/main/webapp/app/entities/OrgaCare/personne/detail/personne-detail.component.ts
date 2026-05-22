import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPersonne } from '../personne.model';

@Component({
  selector: 'jhi-personne-detail',
  templateUrl: './personne-detail.component.html',
})
export class PersonneDetailComponent implements OnInit {
  personne: IPersonne | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ personne }) => {
      this.personne = personne;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
