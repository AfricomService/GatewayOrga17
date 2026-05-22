import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { AffectationComponent } from './list/affectation.component';
import { AffectationDetailComponent } from './detail/affectation-detail.component';
import { AffectationUpdateComponent } from './update/affectation-update.component';
import { AffectationDeleteDialogComponent } from './delete/affectation-delete-dialog.component';
import { AffectationRoutingModule } from './route/affectation-routing.module';

@NgModule({
  imports: [SharedModule, AffectationRoutingModule],
  declarations: [AffectationComponent, AffectationDetailComponent, AffectationUpdateComponent, AffectationDeleteDialogComponent],
  entryComponents: [AffectationDeleteDialogComponent],
})
export class OrgaCareAffectationModule {}
