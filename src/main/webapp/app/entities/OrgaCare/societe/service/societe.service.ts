import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISociete, getSocieteIdentifier } from '../societe.model';

export type EntityResponseType = HttpResponse<ISociete>;
export type EntityArrayResponseType = HttpResponse<ISociete[]>;

// Interface pour OrgacareFeignDTO (à adapter selon votre modèle réel)
export interface OrgacareFeignDTO {
  code?: string;
  libelle?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class SocieteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/societes', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // POST /societes
  create(societe: ISociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .post<ISociete>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PUT /societes/{id}
  update(societe: ISociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .put<ISociete>(`${this.resourceUrl}/${getSocieteIdentifier(societe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PATCH /societes/{id}
  partialUpdate(societe: ISociete): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(societe);
    return this.http
      .patch<ISociete>(`${this.resourceUrl}/${getSocieteIdentifier(societe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /societes/{id}
  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ISociete>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /societes (paginée)
  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ISociete[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  // DELETE /societes/{id}
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // GET /societes/by-matricule/{matricule}
  findByMatricule(matricule: string): Observable<Map<string, object>[]> {
    return this.http.get<Map<string, object>[]>(`${this.resourceUrl}/by-matricule/${matricule}`);
  }

  // GET /societes/list  (id + raisonSociale uniquement)
  findAllIdAndRaisonSociale(): Observable<Map<string, object>[]> {
    return this.http.get<Map<string, object>[]>(`${this.resourceUrl}/list`);
  }

  // GET /societes/organigramme-codes
  getAllOrganigrammesCodes(): Observable<OrgacareFeignDTO[]> {
    return this.http.get<OrgacareFeignDTO[]>(`${this.resourceUrl}/organigramme-codes`);
  }

  addSocieteToCollectionIfMissing(societeCollection: ISociete[], ...societesToCheck: (ISociete | null | undefined)[]): ISociete[] {
    const societes: ISociete[] = societesToCheck.filter(isPresent);
    if (societes.length > 0) {
      const societeCollectionIdentifiers = societeCollection.map(societeItem => getSocieteIdentifier(societeItem)!);
      const societesToAdd = societes.filter(societeItem => {
        const societeIdentifier = getSocieteIdentifier(societeItem);
        if (societeIdentifier == null || societeCollectionIdentifiers.includes(societeIdentifier)) {
          return false;
        }
        societeCollectionIdentifiers.push(societeIdentifier);
        return true;
      });
      return [...societesToAdd, ...societeCollection];
    }
    return societeCollection;
  }

  protected convertDateFromClient(societe: ISociete): ISociete {
    return Object.assign({}, societe, {
      dateCreation: societe.dateCreation?.isValid() ? societe.dateCreation.toJSON() : undefined,
      dateActivation: societe.dateActivation?.isValid() ? societe.dateActivation.toJSON() : undefined,
      dateCloture: societe.dateCloture?.isValid() ? societe.dateCloture.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateActivation = res.body.dateActivation ? dayjs(res.body.dateActivation) : undefined;
      res.body.dateCloture = res.body.dateCloture ? dayjs(res.body.dateCloture) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((societe: ISociete) => {
        societe.dateCreation = societe.dateCreation ? dayjs(societe.dateCreation) : undefined;
        societe.dateActivation = societe.dateActivation ? dayjs(societe.dateActivation) : undefined;
        societe.dateCloture = societe.dateCloture ? dayjs(societe.dateCloture) : undefined;
      });
    }
    return res;
  }
}
