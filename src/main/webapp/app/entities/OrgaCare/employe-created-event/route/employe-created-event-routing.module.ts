import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { EmployeCreatedEventComponent } from '../list/employe-created-event.component';
import { EmployeCreatedEventDetailComponent } from '../detail/employe-created-event-detail.component';
import { EmployeCreatedEventUpdateComponent } from '../update/employe-created-event-update.component';
import { EmployeCreatedEventRoutingResolveService } from './employe-created-event-routing-resolve.service';

const employeCreatedEventRoute: Routes = [
  {
    path: '',
    component: EmployeCreatedEventComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: EmployeCreatedEventDetailComponent,
    resolve: {
      employeCreatedEvent: EmployeCreatedEventRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: EmployeCreatedEventUpdateComponent,
    resolve: {
      employeCreatedEvent: EmployeCreatedEventRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: EmployeCreatedEventUpdateComponent,
    resolve: {
      employeCreatedEvent: EmployeCreatedEventRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(employeCreatedEventRoute)],
  exports: [RouterModule],
})
export class EmployeCreatedEventRoutingModule {}
