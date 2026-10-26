import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import * as docx from 'docx-preview';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PieceJointeService } from '../service/piece-jointe.service';

type FileType = 'image' | 'pdf' | 'docx' | 'excel' | 'unsupported';

@Component({
  selector: 'jhi-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss'],
})
export class FilePreviewComponent implements OnChanges {
  @Input() pjId!: number;
  @Input() fileName = 'download';

  @ViewChild('docxContainer', { static: false }) docxContainer?: ElementRef<HTMLElement>;

  isLoading = false;
  errorMsg: string | null = null;
  currentBlob: Blob | null = null;

  fileType: FileType = 'unsupported';

  imageSrc: SafeUrl | null = null;
  pdfSrc: SafeResourceUrl | null = null;
  excelHtml = '';

  constructor(private pieceJointeService: PieceJointeService, private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('pjId' in changes && this.pjId) {
      this.loadFile();
    }
  }

  downloadFile(): void {
    if (this.currentBlob) {
      saveAs(this.currentBlob, this.fileName);
    }
  }

  private loadFile(): void {
    this.isLoading = true;
    this.errorMsg = null;
    this.resetView();

    this.pieceJointeService.getFile(this.pjId).subscribe({
      next: (blob: Blob) => {
        this.currentBlob = blob;
        this.determineFileTypeByName(this.fileName);
        this.renderFile(blob);
        this.isLoading = false;
      },
      error: err => {
        console.error('Download failed', err);
        this.errorMsg = "Impossible de charger l'aperçu.";
        this.isLoading = false;
      },
    });
  }

  private determineFileTypeByName(fileName: string): void {
    if (!fileName) {
      this.fileType = 'unsupported';
      return;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        this.fileType = 'image';
        break;
      case 'pdf':
        this.fileType = 'pdf';
        break;
      case 'doc':
      case 'docx':
        this.fileType = 'docx';
        break;
      case 'xls':
      case 'xlsx':
      case 'csv':
        this.fileType = 'excel';
        break;
      default:
        this.fileType = 'unsupported';
        break;
    }
  }

  private renderFile(blob: Blob): void {
    switch (this.fileType) {
      case 'image': {
        const objectUrl = URL.createObjectURL(blob);
        this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        break;
      }

      case 'pdf': {
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
        break;
      }

      case 'docx':
        setTimeout(() => {
          if (this.docxContainer) {
            docx
              .renderAsync(blob, this.docxContainer.nativeElement, undefined, {
                ignoreWidth: true,
                ignoreHeight: true,
              })
              .catch(() => (this.errorMsg = 'Impossible de rendre le document Word.'));
          }
        }, 0);
        break;

      case 'excel':
        this.renderExcel(blob);
        break;
    }
  }

  private renderExcel(blob: Blob): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      this.excelHtml = XLSX.utils.sheet_to_html(sheet, { id: 'excel-table' });
    };
    reader.readAsBinaryString(blob);
  }

  private resetView(): void {
    this.imageSrc = null;
    this.pdfSrc = null;
    this.excelHtml = '';
    this.fileType = 'unsupported';
    if (this.docxContainer) {
      this.docxContainer.nativeElement.innerHTML = '';
    }
  }
}
