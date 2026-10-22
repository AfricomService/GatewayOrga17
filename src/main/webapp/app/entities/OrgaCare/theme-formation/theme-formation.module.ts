import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { ThemeFormationComponent } from './list/theme-formation.component';
import { ThemeFormationDetailComponent } from './detail/theme-formation-detail.component';
import { ThemeFormationUpdateComponent } from './update/theme-formation-update.component';
import { ThemeFormationDeleteDialogComponent } from './delete/theme-formation-delete-dialog.component';
import { ThemeFormationRoutingModule } from './route/theme-formation-routing.module';

@NgModule({
  imports: [SharedModule, ThemeFormationRoutingModule],
  declarations: [
    ThemeFormationComponent,
    ThemeFormationDetailComponent,
    ThemeFormationUpdateComponent,
    ThemeFormationDeleteDialogComponent,
  ],
  entryComponents: [ThemeFormationDeleteDialogComponent],
})
export class OrgaCareThemeFormationModule {}
