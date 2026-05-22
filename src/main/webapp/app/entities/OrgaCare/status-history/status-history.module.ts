import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StatusHistoryComponent } from './list/status-history.component';
import { StatusHistoryDetailComponent } from './detail/status-history-detail.component';
import { StatusHistoryUpdateComponent } from './update/status-history-update.component';
import { StatusHistoryDeleteDialogComponent } from './delete/status-history-delete-dialog.component';
import { StatusHistoryRoutingModule } from './route/status-history-routing.module';

@NgModule({
  imports: [SharedModule, StatusHistoryRoutingModule],
  declarations: [StatusHistoryComponent, StatusHistoryDetailComponent, StatusHistoryUpdateComponent, StatusHistoryDeleteDialogComponent],
  entryComponents: [StatusHistoryDeleteDialogComponent],
})
export class OrgaCareStatusHistoryModule {}
