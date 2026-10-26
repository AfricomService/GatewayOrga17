import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IThemeFormation } from '../theme-formation.model';
import { ThemeFormationService } from '../service/theme-formation.service';

@Component({
  templateUrl: './theme-formation-delete-dialog.component.html',
})
export class ThemeFormationDeleteDialogComponent {
  themeFormation?: IThemeFormation;

  constructor(protected themeFormationService: ThemeFormationService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.themeFormationService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
