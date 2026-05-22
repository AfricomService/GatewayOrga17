import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormeJuridiqueComponent } from './list/forme-juridique.component';
import { FormeJuridiqueDetailComponent } from './detail/forme-juridique-detail.component';
import { FormeJuridiqueUpdateComponent } from './update/forme-juridique-update.component';
import { FormeJuridiqueDeleteDialogComponent } from './delete/forme-juridique-delete-dialog.component';
import { FormeJuridiqueRoutingModule } from './route/forme-juridique-routing.module';

@NgModule({
  imports: [SharedModule, FormeJuridiqueRoutingModule],
  declarations: [
    FormeJuridiqueComponent,
    FormeJuridiqueDetailComponent,
    FormeJuridiqueUpdateComponent,
    FormeJuridiqueDeleteDialogComponent,
  ],
  entryComponents: [FormeJuridiqueDeleteDialogComponent],
})
export class OrgaCareFormeJuridiqueModule {}
