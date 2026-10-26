import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { PieceJointeComponent } from '../list/piece-jointe.component';
import { PieceJointeDetailComponent } from '../detail/piece-jointe-detail.component';
import { PieceJointeUpdateComponent } from '../update/piece-jointe-update.component';
import { PieceJointeRoutingResolveService } from './piece-jointe-routing-resolve.service';

const pieceJointeRoute: Routes = [
  {
    path: '',
    component: PieceJointeComponent,
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PieceJointeDetailComponent,
    resolve: {
      pieceJointe: PieceJointeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PieceJointeUpdateComponent,
    resolve: {
      pieceJointe: PieceJointeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PieceJointeUpdateComponent,
    resolve: {
      pieceJointe: PieceJointeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(pieceJointeRoute)],
  exports: [RouterModule],
})
export class PieceJointeRoutingModule {}
