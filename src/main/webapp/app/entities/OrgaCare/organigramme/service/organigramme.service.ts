import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOrganigramme, getOrganigrammeIdentifier, IOrganigrammeCode } from '../organigramme.model';

export type EntityResponseType = HttpResponse<IOrganigramme>;
export type EntityArrayResponseType = HttpResponse<IOrganigramme[]>;

@Injectable({ providedIn: 'root' })
export class OrganigrammeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/organigrammes', 'orgacare');
  protected resourceListUrl = this.applicationConfigService.getEndpointFor('api/organigrammesList', 'orgacare');
  protected resourceCodesUrl = this.applicationConfigService.getEndpointFor('api/organigrammes/codes', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // POST /organigrammes
  create(organigramme: IOrganigramme): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organigramme);
    return this.http
      .post<IOrganigramme>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PUT /organigrammes/{id}
  update(organigramme: IOrganigramme): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organigramme);
    return this.http
      .put<IOrganigramme>(`${this.resourceUrl}/${getOrganigrammeIdentifier(organigramme) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PATCH /organigrammes/{id}
  partialUpdate(organigramme: IOrganigramme): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organigramme);
    return this.http
      .patch<IOrganigramme>(`${this.resourceUrl}/${getOrganigrammeIdentifier(organigramme) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /organigrammes/{id}
  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IOrganigramme>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /organigrammes  (paginée)
  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IOrganigramme[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  // GET /organigrammesList  (liste complète sans pagination)
  findAllList(): Observable<IOrganigramme[]> {
    return this.http
      .get<IOrganigramme[]>(this.resourceListUrl)
      .pipe(map((organigrammes: IOrganigramme[]) => this.convertDateArrayFromList(organigrammes)));
  }

  // GET /organigrammes/by-societe/{societeId}
  findBySocieteId(societeId: number): Observable<IOrganigramme[]> {
    return this.http
      .get<IOrganigramme[]>(`${this.resourceUrl}/by-societe/${societeId}`)
      .pipe(map((organigrammes: IOrganigramme[]) => this.convertDateArrayFromList(organigrammes)));
  }

  // DELETE /organigrammes/{id}
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findAllCodes(): Observable<IOrganigrammeCode[]> {
    return this.http.get<IOrganigrammeCode[]>(this.resourceCodesUrl);
  }

  addOrganigrammeToCollectionIfMissing(
    organigrammeCollection: IOrganigramme[],
    ...organigrammesToCheck: (IOrganigramme | null | undefined)[]
  ): IOrganigramme[] {
    const organigrammes: IOrganigramme[] = organigrammesToCheck.filter(isPresent);
    if (organigrammes.length > 0) {
      const organigrammeCollectionIdentifiers = organigrammeCollection.map(
        organigrammeItem => getOrganigrammeIdentifier(organigrammeItem)!
      );
      const organigrammesToAdd = organigrammes.filter(organigrammeItem => {
        const organigrammeIdentifier = getOrganigrammeIdentifier(organigrammeItem);
        if (organigrammeIdentifier == null || organigrammeCollectionIdentifiers.includes(organigrammeIdentifier)) {
          return false;
        }
        organigrammeCollectionIdentifiers.push(organigrammeIdentifier);
        return true;
      });
      return [...organigrammesToAdd, ...organigrammeCollection];
    }
    return organigrammeCollection;
  }

  protected convertDateFromClient(organigramme: IOrganigramme): IOrganigramme {
    return Object.assign({}, organigramme, {
      dateCreation: organigramme.dateCreation?.isValid() ? organigramme.dateCreation.toJSON() : undefined,
      dateAction: organigramme.dateAction?.isValid() ? organigramme.dateAction.toJSON() : undefined,
      dateExpiration: organigramme.dateExpiration?.isValid() ? organigramme.dateExpiration.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateAction = res.body.dateAction ? dayjs(res.body.dateAction) : undefined;
      res.body.dateExpiration = res.body.dateExpiration ? dayjs(res.body.dateExpiration) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((organigramme: IOrganigramme) => {
        organigramme.dateCreation = organigramme.dateCreation ? dayjs(organigramme.dateCreation) : undefined;
        organigramme.dateAction = organigramme.dateAction ? dayjs(organigramme.dateAction) : undefined;
        organigramme.dateExpiration = organigramme.dateExpiration ? dayjs(organigramme.dateExpiration) : undefined;
      });
    }
    return res;
  }

  // Helper pour les méthodes retournant directement IOrganigramme[] (sans HttpResponse)
  protected convertDateArrayFromList(organigrammes: IOrganigramme[]): IOrganigramme[] {
    organigrammes.forEach((organigramme: IOrganigramme) => {
      organigramme.dateCreation = organigramme.dateCreation ? dayjs(organigramme.dateCreation) : undefined;
      organigramme.dateAction = organigramme.dateAction ? dayjs(organigramme.dateAction) : undefined;
      organigramme.dateExpiration = organigramme.dateExpiration ? dayjs(organigramme.dateExpiration) : undefined;
    });
    return organigrammes;
  }
}
