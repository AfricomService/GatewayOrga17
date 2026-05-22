import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { OrganigrammeComponent } from './list/organigramme.component';
import { OrganigrammeDetailComponent } from './detail/organigramme-detail.component';
import { OrganigrammeUpdateComponent } from './update/organigramme-update.component';
import { OrganigrammeDeleteDialogComponent } from './delete/organigramme-delete-dialog.component';
import { OrganigrammeRoutingModule } from './route/organigramme-routing.module';

@NgModule({
  imports: [SharedModule, OrganigrammeRoutingModule],
  declarations: [OrganigrammeComponent, OrganigrammeDetailComponent, OrganigrammeUpdateComponent, OrganigrammeDeleteDialogComponent],
  entryComponents: [OrganigrammeDeleteDialogComponent],
})
export class OrgaCareOrganigrammeModule {}
