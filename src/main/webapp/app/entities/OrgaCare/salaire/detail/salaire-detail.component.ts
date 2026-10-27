import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISalaire } from '../salaire.model';

@Component({
  selector: 'jhi-salaire-detail',
  templateUrl: './salaire-detail.component.html',
})
export class SalaireDetailComponent implements OnInit {
  salaire: ISalaire | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ salaire }) => {
      this.salaire = salaire;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
