import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';

@Component({
  selector: 'jhi-personne-selection-modal',
  templateUrl: './personne-selection-modal.component.html',
  styleUrls: ['./personne-selection-modal.component.scss'],
})
export class PersonneSelectionModalComponent implements OnInit {
  @Input() title = 'Sélection';
  @Input() personnes: IPersonne[] = [];
  @Input() selectedIds: number[] = [];

  search = '';
  selected = new Set<number>();

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.selected = new Set(this.selectedIds);
  }

  get filtered(): IPersonne[] {
    const term = this.search.trim().toLowerCase();
    if (!term) {
      return this.personnes;
    }
    return this.personnes.filter(p => (p.nomPrenom ?? '').toLowerCase().includes(term) || (p.matricule ?? '').toLowerCase().includes(term));
  }

  get allSelected(): boolean {
    return this.filtered.length > 0 && this.filtered.every(p => this.selected.has(p.id!));
  }

  isSelected(id: number): boolean {
    return this.selected.has(id);
  }

  toggle(id: number): void {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.filtered.forEach(p => this.selected.delete(p.id!));
    } else {
      this.filtered.forEach(p => this.selected.add(p.id!));
    }
  }

  trackById(index: number, item: IPersonne): number {
    return item.id!;
  }

  confirm(): void {
    this.activeModal.close(Array.from(this.selected));
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
