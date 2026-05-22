import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { GroupeComponent } from './list/groupe.component';
import { GroupeDetailComponent } from './detail/groupe-detail.component';
import { GroupeUpdateComponent } from './update/groupe-update.component';
import { GroupeDeleteDialogComponent } from './delete/groupe-delete-dialog.component';
import { GroupeRoutingModule } from './route/groupe-routing.module';

@NgModule({
  imports: [SharedModule, GroupeRoutingModule],
  declarations: [GroupeComponent, GroupeDetailComponent, GroupeUpdateComponent, GroupeDeleteDialogComponent],
  entryComponents: [GroupeDeleteDialogComponent],
})
export class OrgaCareGroupeModule {}
