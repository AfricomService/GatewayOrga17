import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { GroupeComponent } from '../list/groupe.component';
import { GroupeDetailComponent } from '../detail/groupe-detail.component';
import { GroupeUpdateComponent } from '../update/groupe-update.component';
import { GroupeRoutingResolveService } from './groupe-routing-resolve.service';

const groupeRoute: Routes = [
  {
    path: '',
    component: GroupeComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: GroupeDetailComponent,
    resolve: {
      groupe: GroupeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: GroupeUpdateComponent,
    resolve: {
      groupe: GroupeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: GroupeUpdateComponent,
    resolve: {
      groupe: GroupeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(groupeRoute)],
  exports: [RouterModule],
})
export class GroupeRoutingModule {}
