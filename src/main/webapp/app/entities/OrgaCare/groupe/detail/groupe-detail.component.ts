import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IGroupe } from '../groupe.model';

@Component({
  selector: 'jhi-groupe-detail',
  templateUrl: './groupe-detail.component.html',
})
export class GroupeDetailComponent implements OnInit {
  groupe: IGroupe | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ groupe }) => {
      this.groupe = groupe;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
