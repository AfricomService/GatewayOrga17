import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { SalaireComponent } from '../list/salaire.component';
import { SalaireDetailComponent } from '../detail/salaire-detail.component';
import { SalaireUpdateComponent } from '../update/salaire-update.component';
import { SalaireRoutingResolveService } from './salaire-routing-resolve.service';

const salaireRoute: Routes = [
  {
    path: '',
    component: SalaireComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: SalaireDetailComponent,
    resolve: {
      salaire: SalaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: SalaireUpdateComponent,
    resolve: {
      salaire: SalaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: SalaireUpdateComponent,
    resolve: {
      salaire: SalaireRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(salaireRoute)],
  exports: [RouterModule],
})
export class SalaireRoutingModule {}
