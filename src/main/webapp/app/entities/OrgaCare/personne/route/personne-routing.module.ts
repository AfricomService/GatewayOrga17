import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PersonneComponent } from '../list/personne.component';
import { PersonneDetailComponent } from '../detail/personne-detail.component';
import { PersonneUpdateComponent } from '../update/personne-update.component';
import { PersonneRoutingResolveService } from './personne-routing-resolve.service';

const personneRoute: Routes = [
  {
    path: '',
    component: PersonneComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PersonneDetailComponent,
    resolve: {
      personne: PersonneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PersonneUpdateComponent,
    resolve: {
      personne: PersonneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PersonneUpdateComponent,
    resolve: {
      personne: PersonneRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(personneRoute)],
  exports: [RouterModule],
})
export class PersonneRoutingModule {}
