import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AbsenceComponent } from './list/absence.component';
import { AbsenceDetailComponent } from './detail/absence-detail.component';
import { AbsenceUpdateComponent } from './update/absence-update.component';
import { AbsenceDeleteDialogComponent } from './delete/absence-delete-dialog.component';
import { AbsenceRoutingModule } from './route/absence-routing.module';

@NgModule({
  imports: [SharedModule, AbsenceRoutingModule],
  declarations: [AbsenceComponent, AbsenceDetailComponent, AbsenceUpdateComponent, AbsenceDeleteDialogComponent],
  entryComponents: [AbsenceDeleteDialogComponent],
})
export class OrgaCareAbsenceModule {}
