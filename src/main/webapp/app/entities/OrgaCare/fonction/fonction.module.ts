import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FonctionComponent } from './list/fonction.component';
import { FonctionDetailComponent } from './detail/fonction-detail.component';
import { FonctionUpdateComponent } from './update/fonction-update.component';
import { FonctionDeleteDialogComponent } from './delete/fonction-delete-dialog.component';
import { FonctionRoutingModule } from './route/fonction-routing.module';

@NgModule({
  imports: [SharedModule, FonctionRoutingModule],
  declarations: [FonctionComponent, FonctionDetailComponent, FonctionUpdateComponent, FonctionDeleteDialogComponent],
  entryComponents: [FonctionDeleteDialogComponent],
})
export class OrgaCareFonctionModule {}
