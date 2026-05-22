import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AffectationComponent } from '../list/affectation.component';
import { AffectationDetailComponent } from '../detail/affectation-detail.component';
import { AffectationUpdateComponent } from '../update/affectation-update.component';
import { AffectationRoutingResolveService } from './affectation-routing-resolve.service';

const affectationRoute: Routes = [
  {
    path: '',
    component: AffectationComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AffectationDetailComponent,
    resolve: {
      affectation: AffectationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AffectationUpdateComponent,
    resolve: {
      affectation: AffectationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AffectationUpdateComponent,
    resolve: {
      affectation: AffectationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(affectationRoute)],
  exports: [RouterModule],
})
export class AffectationRoutingModule {}
