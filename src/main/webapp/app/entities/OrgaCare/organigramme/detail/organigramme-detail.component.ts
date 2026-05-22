import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IOrganigramme } from '../organigramme.model';

@Component({
  selector: 'jhi-organigramme-detail',
  templateUrl: './organigramme-detail.component.html',
})
export class OrganigrammeDetailComponent implements OnInit {
  organigramme: IOrganigramme | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organigramme }) => {
      this.organigramme = organigramme;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
