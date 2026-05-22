import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IContrat } from '../contrat.model';

@Component({
  selector: 'jhi-contrat-detail',
  templateUrl: './contrat-detail.component.html',
})
export class ContratDetailComponent implements OnInit {
  contrat: IContrat | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ contrat }) => {
      this.contrat = contrat;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
