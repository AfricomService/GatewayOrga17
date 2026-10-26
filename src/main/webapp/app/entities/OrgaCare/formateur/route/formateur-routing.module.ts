import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FormateurComponent } from '../list/formateur.component';
import { FormateurDetailComponent } from '../detail/formateur-detail.component';
import { FormateurUpdateComponent } from '../update/formateur-update.component';
import { FormateurRoutingResolveService } from './formateur-routing-resolve.service';

const formateurRoute: Routes = [
  {
    path: '',
    component: FormateurComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FormateurDetailComponent,
    resolve: {
      formateur: FormateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FormateurUpdateComponent,
    resolve: {
      formateur: FormateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FormateurUpdateComponent,
    resolve: {
      formateur: FormateurRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(formateurRoute)],
  exports: [RouterModule],
})
export class FormateurRoutingModule {}
