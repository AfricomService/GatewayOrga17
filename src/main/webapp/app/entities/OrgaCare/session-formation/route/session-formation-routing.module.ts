import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SessionFormationComponent } from '../list/session-formation.component';
import { SessionFormationDetailComponent } from '../detail/session-formation-detail.component';
import { SessionFormationUpdateComponent } from '../update/session-formation-update.component';
import { SessionFormationRoutingResolveService } from './session-formation-routing-resolve.service';

const sessionFormationRoute: Routes = [
  {
    path: '',
    component: SessionFormationComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SessionFormationDetailComponent,
    resolve: {
      sessionFormation: SessionFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SessionFormationUpdateComponent,
    resolve: {
      sessionFormation: SessionFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SessionFormationUpdateComponent,
    resolve: {
      sessionFormation: SessionFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(sessionFormationRoute)],
  exports: [RouterModule],
})
export class SessionFormationRoutingModule {}
