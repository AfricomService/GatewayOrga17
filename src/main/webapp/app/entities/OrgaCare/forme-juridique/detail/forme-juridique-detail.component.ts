import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFormeJuridique } from '../forme-juridique.model';

@Component({
  selector: 'jhi-forme-juridique-detail',
  templateUrl: './forme-juridique-detail.component.html',
})
export class FormeJuridiqueDetailComponent implements OnInit {
  formeJuridique: IFormeJuridique | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ formeJuridique }) => {
      this.formeJuridique = formeJuridique;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
