import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITypeContrat } from '../type-contrat.model';

@Component({
  selector: 'jhi-type-contrat-detail',
  templateUrl: './type-contrat-detail.component.html',
})
export class TypeContratDetailComponent implements OnInit {
  typeContrat: ITypeContrat | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ typeContrat }) => {
      this.typeContrat = typeContrat;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
