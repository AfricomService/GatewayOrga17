import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IGrade } from '../grade.model';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-grade-detail',
  templateUrl: './grade-detail.component.html',
  styleUrls: ['./grade-detail.component.scss'],
})
export class GradeDetailComponent implements OnInit {
  grade: IGrade | null = null;
  canEdit = false;

  // Section Générale ouverte par défaut
  sectionGenerale = true;

  constructor(protected activatedRoute: ActivatedRoute, protected accountService: AccountService) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);
    this.activatedRoute.data.subscribe(({ grade }) => {
      this.grade = grade;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
