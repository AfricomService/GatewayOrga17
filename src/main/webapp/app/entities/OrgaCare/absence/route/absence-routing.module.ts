import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AbsenceComponent } from '../list/absence.component';
import { AbsenceDetailComponent } from '../detail/absence-detail.component';
import { AbsenceUpdateComponent } from '../update/absence-update.component';
import { AbsenceRoutingResolveService } from './absence-routing-resolve.service';

const absenceRoute: Routes = [
  {
    path: '',
    component: AbsenceComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: AbsenceDetailComponent,
    resolve: {
      absence: AbsenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: AbsenceUpdateComponent,
    resolve: {
      absence: AbsenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: AbsenceUpdateComponent,
    resolve: {
      absence: AbsenceRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(absenceRoute)],
  exports: [RouterModule],
})
export class AbsenceRoutingModule {}
