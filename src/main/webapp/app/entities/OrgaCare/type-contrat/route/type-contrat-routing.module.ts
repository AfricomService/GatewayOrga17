import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TypeContratComponent } from '../list/type-contrat.component';
import { TypeContratDetailComponent } from '../detail/type-contrat-detail.component';
import { TypeContratUpdateComponent } from '../update/type-contrat-update.component';
import { TypeContratRoutingResolveService } from './type-contrat-routing-resolve.service';

const typeContratRoute: Routes = [
  {
    path: '',
    component: TypeContratComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TypeContratDetailComponent,
    resolve: {
      typeContrat: TypeContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TypeContratUpdateComponent,
    resolve: {
      typeContrat: TypeContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TypeContratUpdateComponent,
    resolve: {
      typeContrat: TypeContratRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(typeContratRoute)],
  exports: [RouterModule],
})
export class TypeContratRoutingModule {}
