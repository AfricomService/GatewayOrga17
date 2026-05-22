import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SocieteComponent } from '../list/societe.component';
import { SocieteDetailComponent } from '../detail/societe-detail.component';
import { SocieteUpdateComponent } from '../update/societe-update.component';
import { SocieteRoutingResolveService } from './societe-routing-resolve.service';

const societeRoute: Routes = [
  {
    path: '',
    component: SocieteComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SocieteDetailComponent,
    resolve: {
      societe: SocieteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SocieteUpdateComponent,
    resolve: {
      societe: SocieteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SocieteUpdateComponent,
    resolve: {
      societe: SocieteRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(societeRoute)],
  exports: [RouterModule],
})
export class SocieteRoutingModule {}
