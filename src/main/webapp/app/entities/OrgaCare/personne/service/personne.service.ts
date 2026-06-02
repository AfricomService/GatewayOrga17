import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPersonne, getPersonneIdentifier } from '../personne.model';

export type EntityResponseType = HttpResponse<IPersonne>;
export type EntityArrayResponseType = HttpResponse<IPersonne[]>;

// ─── Filtres pour getAllPersonnes ────────────────────────────────────────────
export interface PersonneFilter {
  matricule?: string;
  nomPrenom?: string;
  numTelephone?: string;
  cin?: string;
  typeContratId?: string;
}

@Injectable({ providedIn: 'root' })
export class PersonneService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/personnes', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD de base (générés par JHipster — conservés tels quels)
  // ═══════════════════════════════════════════════════════════════════════════

  /** POST /api/personnes */
  create(personne: IPersonne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personne);
    return this.http.post<IPersonne>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertDateFromServer(res)));
  }

  /** PUT /api/personnes */
  update(personne: IPersonne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personne);
    return this.http.put<IPersonne>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertDateFromServer(res)));
  }

  /** PATCH /api/personnes/:id */
  partialUpdate(personne: IPersonne): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(personne);
    return this.http
      .patch<IPersonne>(`${this.resourceUrl}/${getPersonneIdentifier(personne) as number}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  /** GET /api/personnes/:id */
  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPersonne>(`${this.resourceUrl}/${id}`, { observe: 'response' }).pipe(map(res => this.convertDateFromServer(res)));
  }

  /** DELETE /api/personnes/:id */
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addPersonneToCollectionIfMissing(personneCollection: IPersonne[], ...personnesToCheck: (IPersonne | null | undefined)[]): IPersonne[] {
    const personnes: IPersonne[] = personnesToCheck.filter(isPresent);
    if (personnes.length > 0) {
      const ids = personneCollection.map(p => getPersonneIdentifier(p)!);
      const toAdd = personnes.filter(p => {
        const id = getPersonneIdentifier(p);
        if (id == null || ids.includes(id)) {
          return false;
        }
        ids.push(id);
        return true;
      });
      return [...toAdd, ...personneCollection];
    }
    return personneCollection;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnes — liste paginée avec filtres optionnels
  // Correspond à : getAllPersonnes(Pageable, matricule, nomPrenom, ...)
  // ═══════════════════════════════════════════════════════════════════════════

  query(req?: any, filters?: PersonneFilter): Observable<EntityArrayResponseType> {
    let options = createRequestOption(req);
    if (filters) {
      if (filters.matricule) {
        options = options.set('matricule', filters.matricule);
      }
      if (filters.nomPrenom) {
        options = options.set('nomPrenom', filters.nomPrenom);
      }
      if (filters.numTelephone) {
        options = options.set('numTelephone', filters.numTelephone);
      }
      if (filters.cin) {
        options = options.set('cin', filters.cin);
      }
      if (filters.typeContratId) {
        options = options.set('typeContratId', filters.typeContratId);
      }
    }
    return this.http
      .get<IPersonne[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertDateArrayFromServer(res)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnesList — liste complète sans pagination
  // ═══════════════════════════════════════════════════════════════════════════

  findAll(): Observable<IPersonne[]> {
    const url = this.applicationConfigService.getEndpointFor('api/personnesList', 'orgacare');
    return this.http.get<IPersonne[]>(url).pipe(map(list => list.map(p => this.convertPersonneDatesFromServer(p))));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnes/search?keyword=xxx — recherche full-text paginée
  // ═══════════════════════════════════════════════════════════════════════════

  search(keyword: string, req?: any): Observable<EntityArrayResponseType> {
    let options = createRequestOption(req);
    if (keyword) {
      options = options.set('keyword', keyword);
    }
    return this.http
      .get<IPersonne[]>(`${this.resourceUrl}/search`, { params: options, observe: 'response' })
      .pipe(map(res => this.convertDateArrayFromServer(res)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnes/by-matricule/:matricule
  // ═══════════════════════════════════════════════════════════════════════════

  findByMatricule(matricule: string): Observable<EntityResponseType> {
    return this.http
      .get<IPersonne>(`${this.resourceUrl}/by-matricule/${encodeURIComponent(matricule)}`, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnes/by-user/:userId
  // ═══════════════════════════════════════════════════════════════════════════

  findByUserId(userId: number): Observable<EntityResponseType> {
    return this.http
      .get<IPersonne>(`${this.resourceUrl}/by-user/${userId}`, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /api/personnes/generate-next-matricule?prefix=xxx
  // Retourne le prochain matricule disponible sous forme de string brut
  // ═══════════════════════════════════════════════════════════════════════════

  generateNextMatricule(prefix: string): Observable<string> {
    const params = new HttpParams().set('prefix', prefix);
    return this.http.get(`${this.resourceUrl}/generate-next-matricule`, {
      params,
      responseType: 'text',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUT /api/personnes/by-matricule/:matricule
  // Met à jour nomPrenom et/ou email par matricule
  // ═══════════════════════════════════════════════════════════════════════════

  updateByMatricule(matricule: string, updates: { nomPrenom?: string; email?: string }): Observable<EntityResponseType> {
    return this.http
      .put<IPersonne>(`${this.resourceUrl}/by-matricule/${encodeURIComponent(matricule)}`, updates, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/personnes/names-by-matricules
  // Envoie une liste de matricules, reçoit { matricule: nomPrenom }
  // ═══════════════════════════════════════════════════════════════════════════

  findNamesByMatricules(matricules: string[]): Observable<Record<string, string>> {
    return this.http.post<Record<string, string>>(`${this.resourceUrl}/names-by-matricules`, matricules);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/personnes/:id/create-account
  // Crée un compte Keycloak pour la personne avec le mot de passe donné
  // ═══════════════════════════════════════════════════════════════════════════

  createAccount(id: number, password: string, confirmPassword: string): Observable<HttpResponse<void>> {
    const params = new HttpParams().set('password', password).set('confirmPassword', confirmPassword);
    return this.http.post<void>(`${this.resourceUrl}/${id}/create-account`, null, { params, observe: 'response' });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /api/personnes/import-excel
  // Importe une liste de personnes depuis un fichier Excel
  // ═══════════════════════════════════════════════════════════════════════════

  importFromExcel(file: File): Observable<IPersonne[]> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<IPersonne[]>(`${this.resourceUrl}/import-excel`, formData)
      .pipe(map(list => list.map(p => this.convertPersonneDatesFromServer(p))));
  }

  // NOUVEAU — méthodes avant les protected
  // Assigner un user à une personne
  assignUser(personneId: number, userId: string): Observable<EntityResponseType> {
    return this.http
      .put<IPersonne>(`${this.resourceUrl}/${personneId}/assign-user/${encodeURIComponent(userId)}`, null, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  unassignUser(personneId: number): Observable<EntityResponseType> {
    return this.http
      .put<IPersonne>(`${this.resourceUrl}/${personneId}/unassign-user`, null, { observe: 'response' })
      .pipe(map(res => this.convertDateFromServer(res)));
  }

  getAssignedUserIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.resourceUrl}/assigned-user-ids`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Conversion des dates (dayjs) — client → serveur / serveur → client
  // ═══════════════════════════════════════════════════════════════════════════

  protected convertDateFromClient(personne: IPersonne): IPersonne {
    return Object.assign({}, personne, {
      dateCreation: personne.dateCreation?.isValid() ? personne.dateCreation.toJSON() : undefined,
      dateDebutContrat: personne.dateDebutContrat?.isValid() ? personne.dateDebutContrat.toJSON() : undefined,
    });
  }

  protected convertPersonneDatesFromServer(personne: IPersonne): IPersonne {
    personne.dateCreation = personne.dateCreation ? dayjs(personne.dateCreation) : undefined;
    personne.dateDebutContrat = personne.dateDebutContrat ? dayjs(personne.dateDebutContrat) : undefined;
    return personne;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      this.convertPersonneDatesFromServer(res.body);
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach(p => this.convertPersonneDatesFromServer(p));
    }
    return res;
  }
}
