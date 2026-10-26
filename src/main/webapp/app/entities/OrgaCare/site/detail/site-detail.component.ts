import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ISite } from '../site.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-site-detail',
  templateUrl: './site-detail.component.html',
  styleUrls: ['./site-detail.component.scss'],
})
export class SiteDetailComponent implements OnInit {
  site: ISite | null = null;
  canEdit = false;

  // Accordion section states — Section Générale is open by default
  sectionGenerale = true;
  sectionAdresse = false;
  sectionCommunication = false;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ site }) => {
      this.site = site;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
