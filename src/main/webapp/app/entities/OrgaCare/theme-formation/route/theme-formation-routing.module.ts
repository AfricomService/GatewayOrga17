import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ThemeFormationComponent } from '../list/theme-formation.component';
import { ThemeFormationDetailComponent } from '../detail/theme-formation-detail.component';
import { ThemeFormationUpdateComponent } from '../update/theme-formation-update.component';
import { ThemeFormationRoutingResolveService } from './theme-formation-routing-resolve.service';

const themeFormationRoute: Routes = [
  {
    path: '',
    component: ThemeFormationComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: ThemeFormationDetailComponent,
    resolve: {
      themeFormation: ThemeFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: ThemeFormationUpdateComponent,
    resolve: {
      themeFormation: ThemeFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: ThemeFormationUpdateComponent,
    resolve: {
      themeFormation: ThemeFormationRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(themeFormationRoute)],
  exports: [RouterModule],
})
export class ThemeFormationRoutingModule {}
