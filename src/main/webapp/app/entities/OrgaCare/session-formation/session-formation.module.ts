import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SessionFormationComponent } from './list/session-formation.component';
import { SessionFormationDetailComponent } from './detail/session-formation-detail.component';
import { SessionFormationUpdateComponent } from './update/session-formation-update.component';
import { SessionFormationDeleteDialogComponent } from './delete/session-formation-delete-dialog.component';
import { SessionFormationRoutingModule } from './route/session-formation-routing.module';

@NgModule({
  imports: [SharedModule, SessionFormationRoutingModule],
  declarations: [
    SessionFormationComponent,
    SessionFormationDetailComponent,
    SessionFormationUpdateComponent,
    SessionFormationDeleteDialogComponent,
  ],
  entryComponents: [SessionFormationDeleteDialogComponent],
})
export class OrgaCareSessionFormationModule {}
