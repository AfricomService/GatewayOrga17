import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { IOrganigramme, Organigramme } from '../organigramme.model';
import { OrganigrammeService } from '../service/organigramme.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { ISite } from 'app/entities/OrgaCare/site/site.model';
import { SiteService } from 'app/entities/OrgaCare/site/service/site.service';
import { IDepartement, Departement } from 'app/entities/OrgaCare/departement/departement.model';
import { DepartementService } from 'app/entities/OrgaCare/departement/service/departement.service';
import { Etat } from 'app/entities/enumerations/etat.model';

@Component({
  selector: 'jhi-organigramme-update',
  templateUrl: './organigramme-update.component.html',
  styleUrls: ['./organigramme-update.component.scss'],
})
export class OrganigrammeUpdateComponent implements OnInit {
  // ── @ViewChild ────────────────────────────────────────
  @ViewChild('departementModal') departementModal!: TemplateRef<any>;

  // ── Public fields ─────────────────────────────────────
  isSaving = false;
  isSavingDept = false;

  sectionGenerale = true;
  sectionDepartements = false;

  societesSharedCollection: ISociete[] = [];
  sitesCollection: ISite[] = [];
  departementsCreated: IDepartement[] = [];

  currentOrganigrammeCode: string | null = null;

  departementTree: any[] = [];

  expandedNodes = new Set<number>();
  // nouveau
  expandedAccordionNodes = new Set<number>();

  editForm = this.fb.group({
    id: [],
    code: [],
    nom: [],
    societe: [],
  });

  deptForm = this.fb.group({
    nom: [null],
    code: [null],
    email: [null],
    site: [null],
    departementParentId: [null],
  });

  // ── Public fields ─────────────────────────────────────
  editModeActive = false;
  selectedDeptNode: any = null;
  isRenaming = false;
  renameValue = '';

  // ── Private fields ────────────────────────────────────
  private moveModalRef?: NgbModalRef;
  private modalRef?: NgbModalRef;
  private currentSocieteId: number | null = null;

  // ── Constructor ───────────────────────────────────────
  constructor(
    protected organigrammeService: OrganigrammeService,
    protected societeService: SocieteService,
    protected siteService: SiteService,
    protected departementService: DepartementService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder,
    protected modalService: NgbModal
  ) {}

  // ── Lifecycle ─────────────────────────────────────────

  // Nouveau
  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ organigramme }) => {
      this.updateForm(organigramme);
      this.loadRelationshipsOptions();
      this.loadSites();

      if (organigramme.id !== undefined) {
        this.departementService
          .query()
          .pipe(map((res: HttpResponse<IDepartement[]>) => res.body ?? []))
          .subscribe((depts: IDepartement[]) => (this.departementsCreated = depts.filter(d => d.organigrammeId === organigramme.id)));

        // Charger l'arbre pour l'accordéon
        if (this.currentOrganigrammeCode) {
          this.refreshDepartementTree();
        }
      }
    });
  }

  // ── Organigramme ──────────────────────────────────────

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const organigramme = this.createFromForm();
    if (organigramme.id !== undefined) {
      this.subscribeToSaveResponse(this.organigrammeService.update(organigramme));
    } else {
      this.subscribeToSaveResponse(this.organigrammeService.create(organigramme));
    }
  }

  trackSocieteById(_index: number, item: ISociete): number {
    return item.id!;
  }

  trackSiteById(_index: number, item: ISite): number {
    return item.id!;
  }

  compareSociete(s1: ISociete | null, s2: ISociete | null): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareSite(s1: ISite | null, s2: ISite | null): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  // ── Modal département ─────────────────────────────────

  openDepartementModal(): void {
    this.deptForm.reset();
    this.loadDepartementTree();
    this.modalRef = this.modalService.open(this.departementModal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  closeDepartementModal(): void {
    this.modalRef?.close();
  }

  selectDepartementParent(node: any): void {
    this.deptForm.get('departementParentId')!.setValue(node.id);
  }

  getSelectedParentNom(): string {
    const id = this.deptForm.get('departementParentId')!.value;
    if (!id) {
      return '';
    }
    // findNodeNom can return null; fall back to empty string
    return this.findNodeNom(this.departementTree, id as number) ?? '';
  }

  saveDepartement(): void {
    this.isSavingDept = true;

    const selectedSite: ISite | null = this.deptForm.get('site')!.value;

    const selectedSociete: ISociete | null = this.editForm.get('societe')!.value ?? null;

    const dept: IDepartement = {
      ...new Departement(),
      nom: this.deptForm.get('nom')!.value ?? null,
      code: this.deptForm.get('code')!.value ?? null,
      email: this.deptForm.get('email')!.value ?? null,
      organigrammeId: this.editForm.get('id')!.value ?? null,
      siteId: selectedSite?.id ?? null,
      departementParentId: this.deptForm.get('departementParentId')!.value ?? null,
      societeId: selectedSociete?.id ?? null,
      status: Etat.ACTIF,
    };

    this.departementService
      .create(dept)
      .pipe(finalize(() => (this.isSavingDept = false)))
      .subscribe({
        next: (res: HttpResponse<IDepartement>) => {
          if (res.body) {
            this.departementsCreated = [...this.departementsCreated, res.body];
          }
          this.closeDepartementModal();
          this.refreshDepartementTree();
        },
      });
  }

  // Nouveau
  removeDepartement(dept: IDepartement): void {
    if (dept.id === undefined) {
      return;
    }
    this.departementService.delete(dept.id).subscribe(() => {
      this.departementsCreated = this.departementsCreated.filter(d => d.id !== dept.id);
      this.refreshDepartementTree();
    });
  }

  refreshDepartementTree(): void {
    if (!this.currentOrganigrammeCode) {
      return;
    }
    this.departementService.getTree(this.currentOrganigrammeCode).subscribe(tree => {
      this.departementTree = tree;
      // Expand automatiquement les nœuds racine
      tree.forEach((node: any) => {
        if (!this.expandedAccordionNodes.has(node.id)) {
          this.expandedAccordionNodes.add(node.id);
        }
      });
    });
  }

  // nouveau
  toggleAccordionNode(nodeId: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedAccordionNodes.has(nodeId)) {
      this.expandedAccordionNodes.delete(nodeId);
    } else {
      this.expandedAccordionNodes.add(nodeId);
    }
  }

  // ── Modifier département ──────────────────────────────

  toggleEditMode(): void {
    this.editModeActive = !this.editModeActive;
    if (!this.editModeActive) {
      this.selectedDeptNode = null;
      this.isRenaming = false;
      this.renameValue = '';
    }
  }

  selectDeptNodeForEdit(node: any, event: Event): void {
    event.stopPropagation();
    if (!this.editModeActive) {
      return;
    }
    if (this.selectedDeptNode?.id === node.id) {
      this.selectedDeptNode = null;
      this.isRenaming = false;
      this.renameValue = '';
    } else {
      this.selectedDeptNode = node;
      this.isRenaming = false;
      this.renameValue = node.nom ?? '';
    }
  }

  startRename(): void {
    this.isRenaming = true;
    this.renameValue = this.selectedDeptNode?.nom ?? '';
  }

  confirmRename(): void {
    if (!this.selectedDeptNode || !this.renameValue.trim()) {
      return;
    }
    this.departementService
      .partialUpdate({
        id: this.selectedDeptNode.id,
        nom: this.renameValue.trim(),
      })
      .subscribe(() => {
        this.refreshDepartementTree();
        this.selectedDeptNode = null;
        this.isRenaming = false;
        this.renameValue = '';
      });
  }

  cancelRename(): void {
    this.isRenaming = false;
    this.renameValue = this.selectedDeptNode?.nom ?? '';
  }

  openMoveModal(template: TemplateRef<any>): void {
    this.loadDepartementTree();
    this.deptForm.get('departementParentId')!.setValue(null);
    this.moveModalRef = this.modalService.open(template, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  closeMoveModal(): void {
    this.moveModalRef?.close();
  }

  confirmMove(): void {
    if (!this.selectedDeptNode) {
      return;
    }
    const newParentId: number | null = this.deptForm.get('departementParentId')!.value;
    if (!newParentId) {
      return;
    }
    this.departementService.deplacer(this.selectedDeptNode.id, newParentId).subscribe(() => {
      this.closeMoveModal();
      this.refreshDepartementTree();
      this.selectedDeptNode = null;
      this.isRenaming = false;
    });
  }

  isAccordionExpanded(nodeId: number): boolean {
    return this.expandedAccordionNodes.has(nodeId);
  }

  // Nouveau
  loadDepartementTree(): void {
    if (!this.currentOrganigrammeCode) {
      this.departementTree = [];
      return;
    }
    this.departementService.getTree(this.currentOrganigrammeCode).subscribe(tree => {
      this.departementTree = tree;
      // Auto-expand le premier niveau
      this.expandedNodes.clear();
      tree.forEach((node: any) => this.expandedNodes.add(node.id));
    });
  }

  toggleNode(nodeId: number, event: Event): void {
    event.stopPropagation();
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  isExpanded(nodeId: number): boolean {
    return this.expandedNodes.has(nodeId);
  }

  // ── Protected helpers ─────────────────────────────────

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IOrganigramme>>): void {
    result.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => this.previousState(),
    });
  }

  // Nouveau
  protected updateForm(organigramme: IOrganigramme): void {
    this.editForm.patchValue({
      id: organigramme.id,
      code: organigramme.code ?? null,
      nom: organigramme.nom ?? null,
      societe: organigramme.societe ?? null,
    });
    this.currentOrganigrammeCode = organigramme.code ?? null;
    this.currentSocieteId = organigramme.societeId ?? null; // ← mémoriser l'id
    this.societesSharedCollection = this.societeService.addSocieteToCollectionIfMissing(
      this.societesSharedCollection,
      organigramme.societe
    );
  }

  // Nouveau
  protected loadRelationshipsOptions(): void {
    this.societeService
      .query()
      .pipe(map((res: HttpResponse<ISociete[]>) => res.body ?? []))
      .pipe(map((s: ISociete[]) => this.societeService.addSocieteToCollectionIfMissing(s, this.editForm.get('societe')!.value)))
      .subscribe((s: ISociete[]) => {
        this.societesSharedCollection = s;
        // La liste est prête : patcher le select si on a un societeId
        if (this.currentSocieteId) {
          const matched = s.find(soc => soc.id === this.currentSocieteId) ?? null;
          if (matched) {
            this.editForm.patchValue({ societe: matched });
          }
        }
      });
  }

  protected loadSites(): void {
    this.siteService
      .query()
      .pipe(map((res: HttpResponse<ISite[]>) => res.body ?? []))
      .subscribe((sites: ISite[]) => (this.sitesCollection = sites));
  }

  // Nouveau
  protected createFromForm(): IOrganigramme {
    const societe: ISociete | null = this.editForm.get(['societe'])!.value ?? null;
    return {
      ...new Organigramme(),
      id: this.editForm.get(['id'])!.value,
      code: this.editForm.get(['code'])!.value ?? null,
      nom: this.editForm.get(['nom'])!.value ?? null,
      societe,
      societeId: societe?.id ?? null, // ← le backend lit ce champ
    };
  }

  // ── Private helpers ───────────────────────────────────

  private findNodeNom(nodes: any[], id: number): string | null {
    for (const node of nodes) {
      if (node.id === id) {
        // Cast the concatenated expression to string to satisfy @typescript-eslint/no-unsafe-return
        return (node.nom ?? node.code ?? String(node.id)) as string;
      }
      if (node.children?.length) {
        const found = this.findNodeNom(node.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
