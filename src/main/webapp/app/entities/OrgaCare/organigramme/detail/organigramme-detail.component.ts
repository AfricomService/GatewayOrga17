import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IOrganigramme } from '../organigramme.model';
import { DepartementService } from 'app/entities/OrgaCare/departement/service/departement.service';
import { AccountService } from 'app/core/auth/account.service';

@Component({
  selector: 'jhi-organigramme-detail',
  templateUrl: './organigramme-detail.component.html',
  styleUrls: ['./organigramme-detail.component.scss'],
})
export class OrganigrammeDetailComponent implements OnInit {
  organigramme: IOrganigramme | null = null;

  sectionGenerale = true;
  sectionDepartements = false;

  departementTree: any[] = [];
  departementsCount = 0;
  expandedNodes = new Set<number>();

  canEdit = false;

  constructor(
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected departementService: DepartementService,
    protected accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.canEdit = this.accountService.hasAnyAuthority(['ROLE_ADMIN', 'ROLE_RH']);

    this.activatedRoute.data.subscribe(({ organigramme }) => {
      this.organigramme = organigramme;
      this.loadDepartementTree();
    });
  }

  previousState(): void {
    window.history.back();
  }

  goToEdit(): void {
    if (this.organigramme?.id !== undefined) {
      this.router.navigate(['/organigramme', this.organigramme.id, 'edit']);
    }
  }

  get societeLabel(): string | null {
    const o = this.organigramme as (IOrganigramme & { societeRaisonSociale?: string | null }) | null;
    return o?.societe?.raisonSociale ?? o?.societeRaisonSociale ?? null;
  }

  // ── Arbre des départements (lecture seule) ────────────

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

  protected loadDepartementTree(): void {
    const code = this.organigramme?.code;
    if (!code) {
      this.departementTree = [];
      this.departementsCount = 0;
      return;
    }
    this.departementService.getTree(code).subscribe((tree: any[]) => {
      this.departementTree = tree;
      this.departementsCount = this.countNodes(tree);
      this.expandedNodes.clear();
      this.expandAll(tree);
    });
  }

  private expandAll(nodes: any[]): void {
    nodes.forEach((node: any) => {
      if (node.children?.length) {
        this.expandedNodes.add(node.id);
        this.expandAll(node.children);
      }
    });
  }

  private countNodes(nodes: any[]): number {
    return nodes.reduce((acc: number, node: any) => acc + 1 + (node.children?.length ? this.countNodes(node.children) : 0), 0);
  }
}
