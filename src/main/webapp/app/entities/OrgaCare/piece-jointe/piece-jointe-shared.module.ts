import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { FilePreviewComponent } from './file-preview/file-preview.component';

@NgModule({
  imports: [SharedModule],
  declarations: [FilePreviewComponent],
  exports: [FilePreviewComponent],
})
export class PieceJointeSharedModule {}
