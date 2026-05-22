import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { EmployeCreatedEventComponent } from './list/employe-created-event.component';
import { EmployeCreatedEventDetailComponent } from './detail/employe-created-event-detail.component';
import { EmployeCreatedEventUpdateComponent } from './update/employe-created-event-update.component';
import { EmployeCreatedEventDeleteDialogComponent } from './delete/employe-created-event-delete-dialog.component';
import { EmployeCreatedEventRoutingModule } from './route/employe-created-event-routing.module';

@NgModule({
  imports: [SharedModule, EmployeCreatedEventRoutingModule],
  declarations: [
    EmployeCreatedEventComponent,
    EmployeCreatedEventDetailComponent,
    EmployeCreatedEventUpdateComponent,
    EmployeCreatedEventDeleteDialogComponent,
  ],
  entryComponents: [EmployeCreatedEventDeleteDialogComponent],
})
export class OrgaCareEmployeCreatedEventModule {}
