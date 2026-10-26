import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PieceJointeComponent } from './list/piece-jointe.component';
import { PieceJointeDetailComponent } from './detail/piece-jointe-detail.component';
import { PieceJointeUpdateComponent } from './update/piece-jointe-update.component';
import { PieceJointeDeleteDialogComponent } from './delete/piece-jointe-delete-dialog.component';
import { PieceJointeRoutingModule } from './route/piece-jointe-routing.module';

@NgModule({
  imports: [SharedModule, PieceJointeRoutingModule],
  declarations: [PieceJointeComponent, PieceJointeDetailComponent, PieceJointeUpdateComponent, PieceJointeDeleteDialogComponent],
  entryComponents: [PieceJointeDeleteDialogComponent],
})
export class OrgaCarePieceJointeModule {}
