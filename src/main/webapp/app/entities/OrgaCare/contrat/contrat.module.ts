import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ContratComponent } from './list/contrat.component';
import { ContratDetailComponent } from './detail/contrat-detail.component';
import { ContratUpdateComponent } from './update/contrat-update.component';
import { ContratDeleteDialogComponent } from './delete/contrat-delete-dialog.component';
import { ContratRoutingModule } from './route/contrat-routing.module';

@NgModule({
  imports: [SharedModule, ContratRoutingModule],
  declarations: [ContratComponent, ContratDetailComponent, ContratUpdateComponent, ContratDeleteDialogComponent],
  entryComponents: [ContratDeleteDialogComponent],
})
export class OrgaCareContratModule {}
