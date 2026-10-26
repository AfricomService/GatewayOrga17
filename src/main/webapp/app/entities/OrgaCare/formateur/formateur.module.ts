import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FormateurComponent } from './list/formateur.component';
import { FormateurDetailComponent } from './detail/formateur-detail.component';
import { FormateurUpdateComponent } from './update/formateur-update.component';
import { FormateurDeleteDialogComponent } from './delete/formateur-delete-dialog.component';
import { FormateurRoutingModule } from './route/formateur-routing.module';
import { PieceJointeSharedModule } from 'app/entities/OrgaCare/piece-jointe/piece-jointe-shared.module';

@NgModule({
  imports: [SharedModule, PieceJointeSharedModule, FormateurRoutingModule],
  declarations: [FormateurComponent, FormateurDetailComponent, FormateurUpdateComponent, FormateurDeleteDialogComponent],
  entryComponents: [FormateurDeleteDialogComponent],
})
export class OrgaCareFormateurModule {}
