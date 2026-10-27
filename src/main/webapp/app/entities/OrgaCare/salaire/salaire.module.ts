import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { SalaireComponent } from './list/salaire.component';
import { SalaireDetailComponent } from './detail/salaire-detail.component';
import { SalaireUpdateComponent } from './update/salaire-update.component';
import { SalaireDeleteDialogComponent } from './delete/salaire-delete-dialog.component';
import { SalaireRoutingModule } from './route/salaire-routing.module';

@NgModule({
  imports: [SharedModule, SalaireRoutingModule],
  declarations: [SalaireComponent, SalaireDetailComponent, SalaireUpdateComponent, SalaireDeleteDialogComponent],
  entryComponents: [SalaireDeleteDialogComponent],
})
export class OrgaCareSalaireModule {}
