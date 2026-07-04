import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAffectation, getAffectationIdentifier } from '../affectation.model';
import { TypeAffectation } from 'app/entities/enumerations/type-affectation.model';

export interface IAffecterPersonneRequest {
  personneId: number;
  departementId: number;
  societeId?: number | null;
  type: TypeAffectation;
  dateAction?: string | null;
  dateFin?: string | null;
}

export interface IPersonneAffectationDTO {
  personneId: number;
  matricule: string;
  nomPrenom: string;
  typeAffectation: TypeAffectation;
}

export type EntityResponseType = HttpResponse<IAffectation>;
export type EntityArrayResponseType = HttpResponse<IAffectation[]>;

@Injectable({ providedIn: 'root' })
export class AffectationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/affectations', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  // POST /affectations
  create(affectation: IAffectation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affectation);
    return this.http
      .post<IAffectation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PUT /affectations/{id}
  update(affectation: IAffectation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affectation);
    return this.http
      .put<IAffectation>(`${this.resourceUrl}/${getAffectationIdentifier(affectation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // PATCH /affectations/{id}
  partialUpdate(affectation: IAffectation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(affectation);
    return this.http
      .patch<IAffectation>(`${this.resourceUrl}/${getAffectationIdentifier(affectation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /affectations/{id}
  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IAffectation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  // GET /affectations (paginée)
  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAffectation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  // DELETE /affectations/{id}
  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // GET /affectations/by-departement/{departementId}
  findByDepartementId(departementId: number): Observable<IAffectation[]> {
    return this.http
      .get<IAffectation[]>(`${this.resourceUrl}/by-departement/${departementId}`)
      .pipe(map((affectations: IAffectation[]) => this.convertDateArrayFromList(affectations)));
  }

  // GET /affectations/by-personne/{personneId}
  findByPersonneId(personneId: number): Observable<IAffectation[]> {
    return this.http
      .get<IAffectation[]>(`${this.resourceUrl}/by-personne/${personneId}`)
      .pipe(map((affectations: IAffectation[]) => this.convertDateArrayFromList(affectations)));
  }

  // GET /affectations/emails-by-departement-and-type?departementId=&type=
  findEmailsByDepartementAndType(departementId: number, type: TypeAffectation): Observable<string[]> {
    const params = new HttpParams().set('departementId', departementId.toString()).set('type', type);
    return this.http.get<string[]>(`${this.resourceUrl}/emails-by-departement-and-type`, { params });
  }

  // POST /affectations/affecter-personne
  affecterPersonne(request: IAffecterPersonneRequest): Observable<IAffectation> {
    return this.http
      .post<IAffectation>(`${this.resourceUrl}/affecter-personne`, request)
      .pipe(map((res: IAffectation) => this.convertDatesFromObject(res)));
  }

  // NOUVEAU
  // GET /affectations/by-personne/{personneId}/active
  findAffectationsActivesByPersonneId(personneId: number): Observable<IAffectation[]> {
    return this.http
      .get<IAffectation[]>(`${this.resourceUrl}/by-personne/${personneId}/active`)
      .pipe(map((affectations: IAffectation[]) => this.convertDateArrayFromList(affectations)));
  }

  // GET /affectations/personnes-by-departement/{departementId}
  findPersonnesByDepartementId(departementId: number): Observable<IPersonneAffectationDTO[]> {
    return this.http.get<IPersonneAffectationDTO[]>(`${this.resourceUrl}/personnes-by-departement/${departementId}`);
  }

  addAffectationToCollectionIfMissing(
    affectationCollection: IAffectation[],
    ...affectationsToCheck: (IAffectation | null | undefined)[]
  ): IAffectation[] {
    const affectations: IAffectation[] = affectationsToCheck.filter(isPresent);
    if (affectations.length > 0) {
      const affectationCollectionIdentifiers = affectationCollection.map(affectationItem => getAffectationIdentifier(affectationItem)!);
      const affectationsToAdd = affectations.filter(affectationItem => {
        const affectationIdentifier = getAffectationIdentifier(affectationItem);
        if (affectationIdentifier == null || affectationCollectionIdentifiers.includes(affectationIdentifier)) {
          return false;
        }
        affectationCollectionIdentifiers.push(affectationIdentifier);
        return true;
      });
      return [...affectationsToAdd, ...affectationCollection];
    }
    return affectationCollection;
  }

  protected convertDateFromClient(affectation: IAffectation): IAffectation {
    return Object.assign({}, affectation, {
      dateCreation: affectation.dateCreation?.isValid() ? affectation.dateCreation.toJSON() : undefined,
      dateAction: affectation.dateAction?.isValid() ? affectation.dateAction.toJSON() : undefined,
      dateFin: affectation.dateFin?.isValid() ? affectation.dateFin.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateAction = res.body.dateAction ? dayjs(res.body.dateAction) : undefined;
      res.body.dateFin = res.body.dateFin ? dayjs(res.body.dateFin) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((affectation: IAffectation) => {
        affectation.dateCreation = affectation.dateCreation ? dayjs(affectation.dateCreation) : undefined;
        affectation.dateAction = affectation.dateAction ? dayjs(affectation.dateAction) : undefined;
        affectation.dateFin = affectation.dateFin ? dayjs(affectation.dateFin) : undefined;
      });
    }
    return res;
  }

  protected convertDateArrayFromList(affectations: IAffectation[]): IAffectation[] {
    affectations.forEach((affectation: IAffectation) => {
      affectation.dateCreation = affectation.dateCreation ? dayjs(affectation.dateCreation) : undefined;
      affectation.dateAction = affectation.dateAction ? dayjs(affectation.dateAction) : undefined;
      affectation.dateFin = affectation.dateFin ? dayjs(affectation.dateFin) : undefined;
    });
    return affectations;
  }

  private convertDatesFromObject(affectation: IAffectation): IAffectation {
    affectation.dateCreation = affectation.dateCreation ? dayjs(affectation.dateCreation) : undefined;
    affectation.dateAction = affectation.dateAction ? dayjs(affectation.dateAction) : undefined;
    affectation.dateFin = affectation.dateFin ? dayjs(affectation.dateFin) : undefined;
    return affectation;
  }
}
