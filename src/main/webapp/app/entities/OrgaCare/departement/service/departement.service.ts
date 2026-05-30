import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDepartement, getDepartementIdentifier } from '../departement.model';

export type EntityResponseType = HttpResponse<IDepartement>;
export type EntityArrayResponseType = HttpResponse<IDepartement[]>;

// ─── Modèles locaux ──────────────────────────────────────────────────────────

export interface DepartementTreeDTO {
  id: number;
  code?: string;
  nom?: string;
  children?: DepartementTreeDTO[];
  // autres champs renvoyés par le backend si besoin
  [key: string]: any;
}

export interface DepartementAffectation {
  departementNom?: string;
  affectationType?: string;
  [key: string]: any;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DepartementService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/departements', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD de base (générés par JHipster)
  // ═══════════════════════════════════════════════════════════════════════════

  /** POST /api/departements */
  create(departement: IDepartement): Observable<EntityResponseType> {
    return this.http.post<IDepartement>(this.resourceUrl, departement, { observe: 'response' });
  }

  /** PUT /api/departements */
  update(departement: IDepartement): Observable<EntityResponseType> {
    return this.http.put<IDepartement>(this.resourceUrl, departement, { observe: 'response' });
  }

  /** PATCH /api/departements/:id */
  partialUpdate(departement: IDepartement): Observable<EntityResponseType> {
    return this.http.patch<IDepartement>(`${this.resourceUrl}/${getDepartementIdentifier(departement) as number}`, departement, {
      observe: 'response',
    });
  }

  /** GET /api/departements/:id */
  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IDepartement>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  /** DELETE /api/departements/:id */
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements — liste paginée (eagerload optionnel)
  // ═══════════════════════════════════════════════════════════════════════════

  query(req?: any, eagerload = false): Observable<EntityArrayResponseType> {
    let options = createRequestOption(req);
    if (eagerload) {
      options = options.set('eagerload', 'true');
    }
    return this.http.get<IDepartement[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/All — liste complète sans pagination
  // ═══════════════════════════════════════════════════════════════════════════

  findAll(): Observable<IDepartement[]> {
    return this.http.get<IDepartement[]>(`${this.resourceUrl}/All`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/by-organigramme/:organigrammeId
  // ═══════════════════════════════════════════════════════════════════════════

  findByOrganigramme(organigrammeId: number): Observable<IDepartement[]> {
    return this.http.get<IDepartement[]>(`${this.resourceUrl}/by-organigramme/${organigrammeId}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/by-code/:code
  // ═══════════════════════════════════════════════════════════════════════════

  findByCode(code: string): Observable<EntityResponseType> {
    return this.http.get<IDepartement>(`${this.resourceUrl}/by-code/${encodeURIComponent(code)}`, { observe: 'response' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/by-code-or-throw/:code
  // ═══════════════════════════════════════════════════════════════════════════

  findByCodeOrThrow(code: string): Observable<IDepartement> {
    return this.http.get<IDepartement>(`${this.resourceUrl}/by-code-or-throw/${encodeURIComponent(code)}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/by-matricule/:matricule
  // ═══════════════════════════════════════════════════════════════════════════

  findByMatricule(matricule: string): Observable<EntityResponseType> {
    return this.http.get<IDepartement>(`${this.resourceUrl}/by-matricule/${encodeURIComponent(matricule)}`, { observe: 'response' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/generate-next-code?prefix=xxx
  // Retourne un String brut → responseType: 'text'
  // ═══════════════════════════════════════════════════════════════════════════

  generateNextCode(prefix: string): Observable<string> {
    const params = new HttpParams().set('prefix', prefix);
    return this.http.get(`${this.resourceUrl}/generate-next-code`, {
      params,
      responseType: 'text',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/ogra-code-by-dept-code?deptCode=xxx
  // Retourne un String brut (code organigramme)
  // ═══════════════════════════════════════════════════════════════════════════

  getOrgaCodeByDeptCode(deptCode: string): Observable<string> {
    const params = new HttpParams().set('deptCode', deptCode);
    return this.http.get(`${this.resourceUrl}/ogra-code-by-dept-code`, {
      params,
      responseType: 'text',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/:id/hierarchy
  // ═══════════════════════════════════════════════════════════════════════════

  getHierarchy(id: number): Observable<Record<string, any>[]> {
    return this.http.get<Record<string, any>[]>(`${this.resourceUrl}/${id}/hierarchy`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/departements/:departementId/deplacer?nouveauParentId=xxx
  // ═══════════════════════════════════════════════════════════════════════════

  deplacer(departementId: number, nouveauParentId: number): Observable<IDepartement> {
    const params = new HttpParams().set('nouveauParentId', nouveauParentId.toString());
    return this.http.put<IDepartement>(`${this.resourceUrl}/${departementId}/deplacer`, null, { params });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/with-affectations?societeId=x&organigrammeId=y
  // ═══════════════════════════════════════════════════════════════════════════

  findWithAffectations(societeId: number, organigrammeId?: number): Observable<IDepartement[]> {
    let params = new HttpParams().set('societeId', societeId.toString());
    if (organigrammeId != null) {
      params = params.set('organigrammeId', organigrammeId.toString());
    }
    return this.http.get<IDepartement[]>(`${this.resourceUrl}/with-affectations`, { params });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departementshierarchy/:organigrammeCode — arbre complet avec affectations
  // ═══════════════════════════════════════════════════════════════════════════

  getTreeWithAffectations(organigrammeCode: string): Observable<DepartementTreeDTO[]> {
    const url = this.applicationConfigService.getEndpointFor(
      `api/departementshierarchy/${encodeURIComponent(organigrammeCode)}`,
      'orgacare'
    );
    return this.http.get<DepartementTreeDTO[]>(url);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/tree/:organigrammeCode — arbre simple (sans affectations)
  // ═══════════════════════════════════════════════════════════════════════════

  getTree(organigrammeCode: string): Observable<DepartementTreeDTO[]> {
    return this.http.get<DepartementTreeDTO[]>(`${this.resourceUrl}/tree/${encodeURIComponent(organigrammeCode)}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departement-code-with-children/:deptCode — codes enfants
  // ═══════════════════════════════════════════════════════════════════════════

  getCodeWithChildren(deptCode: string): Observable<string[]> {
    const url = this.applicationConfigService.getEndpointFor(
      `api/departement-code-with-children/${encodeURIComponent(deptCode)}`,
      'orgacare'
    );
    return this.http.get<string[]>(url);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departement-code-with-parents/:deptCode — codes parents
  // ═══════════════════════════════════════════════════════════════════════════

  getCodeWithParents(deptCode: string): Observable<string[]> {
    const url = this.applicationConfigService.getEndpointFor(
      `api/departement-code-with-parents/${encodeURIComponent(deptCode)}`,
      'orgacare'
    );
    return this.http.get<string[]>(url);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/map-parents-by-code/:deptCode
  // Retourne { nomNiveau: [codes] }
  // ═══════════════════════════════════════════════════════════════════════════

  getMapParentsByCode(deptCode: string): Observable<Record<string, string[]>> {
    return this.http.get<Record<string, string[]>>(`${this.resourceUrl}/map-parents-by-code/${encodeURIComponent(deptCode)}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements-nom-by-code/:deptCode — nom du département par code
  // Retourne un String brut
  // ═══════════════════════════════════════════════════════════════════════════

  getNomByCode(deptCode: string): Observable<string> {
    const url = this.applicationConfigService.getEndpointFor(`api/departements-nom-by-code/${encodeURIComponent(deptCode)}`, 'orgacare');
    return this.http.get(url, { responseType: 'text' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/nom-by-matricule/:matricule — nom du département par matricule
  // Retourne un String brut
  // ═══════════════════════════════════════════════════════════════════════════

  getNomByMatricule(matricule: string): Observable<string> {
    return this.http.get(`${this.resourceUrl}/nom-by-matricule/${encodeURIComponent(matricule)}`, { responseType: 'text' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/departements/names-by-codes
  // Envoie une liste de codes, reçoit { code: nom }
  // ═══════════════════════════════════════════════════════════════════════════

  findNamesByCodes(codes: string[]): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(`${this.resourceUrl}/names-by-codes`, codes);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/departements/user/:userId/affectations
  // Retourne [{ departementNom, affectationType, ... }]
  // ═══════════════════════════════════════════════════════════════════════════

  findAffectationsByUser(userId: number): Observable<DepartementAffectation[]> {
    return this.http.get<DepartementAffectation[]>(`${this.resourceUrl}/user/${userId}/affectations`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utilitaire JHipster — évite les doublons dans les collections
  // ═══════════════════════════════════════════════════════════════════════════

  addDepartementToCollectionIfMissing(
    departementCollection: IDepartement[],
    ...departementsToCheck: (IDepartement | null | undefined)[]
  ): IDepartement[] {
    const departements: IDepartement[] = departementsToCheck.filter(isPresent);
    if (departements.length > 0) {
      const ids = departementCollection.map(d => getDepartementIdentifier(d)!);
      const toAdd = departements.filter(d => {
        const id = getDepartementIdentifier(d);
        if (id == null || ids.includes(id)) {
          return false;
        }
        ids.push(id);
        return true;
      });
      return [...toAdd, ...departementCollection];
    }
    return departementCollection;
  }
}
