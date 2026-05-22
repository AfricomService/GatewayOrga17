import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { FonctionComponent } from '../list/fonction.component';
import { FonctionDetailComponent } from '../detail/fonction-detail.component';
import { FonctionUpdateComponent } from '../update/fonction-update.component';
import { FonctionRoutingResolveService } from './fonction-routing-resolve.service';

const fonctionRoute: Routes = [
  {
    path: '',
    component: FonctionComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: FonctionDetailComponent,
    resolve: {
      fonction: FonctionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: FonctionUpdateComponent,
    resolve: {
      fonction: FonctionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: FonctionUpdateComponent,
    resolve: {
      fonction: FonctionRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(fonctionRoute)],
  exports: [RouterModule],
})
export class FonctionRoutingModule {}
