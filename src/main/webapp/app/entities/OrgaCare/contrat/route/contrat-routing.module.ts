import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ContratComponent } from '../list/contrat.component';
import { ContratDetailComponent } from '../detail/contrat-detail.component';
import { ContratUpdateComponent } from '../update/contrat-update.component';
import { ContratRoutingResolveService } from './contrat-routing-resolve.service';

const contratRoute: Routes = [
  {
    path: '',
    component: ContratComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ContratDetailComponent,
    resolve: {
      contrat: ContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ContratUpdateComponent,
    resolve: {
      contrat: ContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ContratUpdateComponent,
    resolve: {
      contrat: ContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(contratRoute)],
  exports: [RouterModule],
})
export class ContratRoutingModule {}
