import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { OrganigrammeComponent } from '../list/organigramme.component';
import { OrganigrammeDetailComponent } from '../detail/organigramme-detail.component';
import { OrganigrammeUpdateComponent } from '../update/organigramme-update.component';
import { OrganigrammeRoutingResolveService } from './organigramme-routing-resolve.service';

const organigrammeRoute: Routes = [
  {
    path: '',
    component: OrganigrammeComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: OrganigrammeDetailComponent,
    resolve: {
      organigramme: OrganigrammeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: OrganigrammeUpdateComponent,
    resolve: {
      organigramme: OrganigrammeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: OrganigrammeUpdateComponent,
    resolve: {
      organigramme: OrganigrammeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(organigrammeRoute)],
  exports: [RouterModule],
})
export class OrganigrammeRoutingModule {}
