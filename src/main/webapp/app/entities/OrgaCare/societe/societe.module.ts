import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SocieteComponent } from './list/societe.component';
import { SocieteDetailComponent } from './detail/societe-detail.component';
import { SocieteUpdateComponent } from './update/societe-update.component';
import { SocieteDeleteDialogComponent } from './delete/societe-delete-dialog.component';
import { SocieteRoutingModule } from './route/societe-routing.module';

@NgModule({
  imports: [SharedModule, SocieteRoutingModule],
  declarations: [SocieteComponent, SocieteDetailComponent, SocieteUpdateComponent, SocieteDeleteDialogComponent],
  entryComponents: [SocieteDeleteDialogComponent],
})
export class OrgaCareSocieteModule {}
