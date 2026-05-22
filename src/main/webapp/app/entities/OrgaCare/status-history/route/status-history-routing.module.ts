import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StatusHistoryComponent } from '../list/status-history.component';
import { StatusHistoryDetailComponent } from '../detail/status-history-detail.component';
import { StatusHistoryUpdateComponent } from '../update/status-history-update.component';
import { StatusHistoryRoutingResolveService } from './status-history-routing-resolve.service';

const statusHistoryRoute: Routes = [
  {
    path: '',
    component: StatusHistoryComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StatusHistoryDetailComponent,
    resolve: {
      statusHistory: StatusHistoryRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StatusHistoryUpdateComponent,
    resolve: {
      statusHistory: StatusHistoryRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StatusHistoryUpdateComponent,
    resolve: {
      statusHistory: StatusHistoryRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(statusHistoryRoute)],
  exports: [RouterModule],
})
export class StatusHistoryRoutingModule {}
