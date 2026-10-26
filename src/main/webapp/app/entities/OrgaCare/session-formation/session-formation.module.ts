import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SessionFormationComponent } from './list/session-formation.component';
import { SessionFormationDetailComponent } from './detail/session-formation-detail.component';
import { SessionFormationUpdateComponent } from './update/session-formation-update.component';
import { SessionFormationDeleteDialogComponent } from './delete/session-formation-delete-dialog.component';
import { SessionFormationRoutingModule } from './route/session-formation-routing.module';
import { PersonneSelectionModalComponent } from './personne-selection-modal/personne-selection-modal.component';
import { PieceJointeSharedModule } from 'app/entities/OrgaCare/piece-jointe/piece-jointe-shared.module';

@NgModule({
  imports: [SharedModule, PieceJointeSharedModule, SessionFormationRoutingModule],
  declarations: [
    SessionFormationComponent,
    SessionFormationDetailComponent,
    SessionFormationUpdateComponent,
    SessionFormationDeleteDialogComponent,
    PersonneSelectionModalComponent,
  ],
  entryComponents: [SessionFormationDeleteDialogComponent, PersonneSelectionModalComponent],
})
export class OrgaCareSessionFormationModule {}
