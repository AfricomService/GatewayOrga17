import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TypeContratComponent } from './list/type-contrat.component';
import { TypeContratDetailComponent } from './detail/type-contrat-detail.component';
import { TypeContratUpdateComponent } from './update/type-contrat-update.component';
import { TypeContratDeleteDialogComponent } from './delete/type-contrat-delete-dialog.component';
import { TypeContratRoutingModule } from './route/type-contrat-routing.module';

@NgModule({
  imports: [SharedModule, TypeContratRoutingModule],
  declarations: [TypeContratComponent, TypeContratDetailComponent, TypeContratUpdateComponent, TypeContratDeleteDialogComponent],
  entryComponents: [TypeContratDeleteDialogComponent],
})
export class OrgaCareTypeContratModule {}
