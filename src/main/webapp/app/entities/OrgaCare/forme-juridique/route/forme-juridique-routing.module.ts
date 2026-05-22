import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FormeJuridiqueComponent } from '../list/forme-juridique.component';
import { FormeJuridiqueDetailComponent } from '../detail/forme-juridique-detail.component';
import { FormeJuridiqueUpdateComponent } from '../update/forme-juridique-update.component';
import { FormeJuridiqueRoutingResolveService } from './forme-juridique-routing-resolve.service';

const formeJuridiqueRoute: Routes = [
  {
    path: '',
    component: FormeJuridiqueComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FormeJuridiqueDetailComponent,
    resolve: {
      formeJuridique: FormeJuridiqueRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FormeJuridiqueUpdateComponent,
    resolve: {
      formeJuridique: FormeJuridiqueRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FormeJuridiqueUpdateComponent,
    resolve: {
      formeJuridique: FormeJuridiqueRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(formeJuridiqueRoute)],
  exports: [RouterModule],
})
export class FormeJuridiqueRoutingModule {}
