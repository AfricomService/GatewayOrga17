import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IFonction } from '../fonction.model';

@Component({
  selector: 'jhi-fonction-detail',
  templateUrl: './fonction-detail.component.html',
})
export class FonctionDetailComponent implements OnInit {
  fonction: IFonction | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ fonction }) => {
      this.fonction = fonction;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
