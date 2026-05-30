// NOUVEAU — personne.module.ts
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { PersonneComponent } from './list/personne.component';
import { PersonneDetailComponent } from './detail/personne-detail.component';
import { PersonneUpdateComponent } from './update/personne-update.component';
import { PersonneDeleteDialogComponent } from './delete/personne-delete-dialog.component';
import { PersonneRoutingModule } from './route/personne-routing.module';
import { DxDataGridModule, DxLoadPanelModule, DxSelectBoxModule, DxTreeListModule } from 'devextreme-angular';

@NgModule({
  imports: [SharedModule, PersonneRoutingModule, DxDataGridModule, DxLoadPanelModule, DxTreeListModule, DxSelectBoxModule],
  declarations: [PersonneComponent, PersonneDetailComponent, PersonneUpdateComponent, PersonneDeleteDialogComponent],
  entryComponents: [PersonneDeleteDialogComponent],
})
export class OrgaCarePersonneModule {}
