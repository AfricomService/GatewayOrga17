import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFormation, getFormationIdentifier } from '../formation.model';

export type EntityResponseType = HttpResponse<IFormation>;
export type EntityArrayResponseType = HttpResponse<IFormation[]>;

@Injectable({ providedIn: 'root' })
export class FormationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/formations', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(formation: IFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formation);
    return this.http
      .post<IFormation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(formation: IFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formation);
    return this.http
      .put<IFormation>(`${this.resourceUrl}/${getFormationIdentifier(formation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(formation: IFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formation);
    return this.http
      .patch<IFormation>(`${this.resourceUrl}/${getFormationIdentifier(formation) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IFormation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IFormation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addFormationToCollectionIfMissing(
    formationCollection: IFormation[],
    ...formationsToCheck: (IFormation | null | undefined)[]
  ): IFormation[] {
    const formations: IFormation[] = formationsToCheck.filter(isPresent);
    if (formations.length > 0) {
      const formationCollectionIdentifiers = formationCollection.map(formationItem => getFormationIdentifier(formationItem)!);
      const formationsToAdd = formations.filter(formationItem => {
        const formationIdentifier = getFormationIdentifier(formationItem);
        if (formationIdentifier == null || formationCollectionIdentifiers.includes(formationIdentifier)) {
          return false;
        }
        formationCollectionIdentifiers.push(formationIdentifier);
        return true;
      });
      return [...formationsToAdd, ...formationCollection];
    }
    return formationCollection;
  }

  protected convertDateFromClient(formation: IFormation): IFormation {
    return Object.assign({}, formation, {
      dateObtentionCertificat: formation.dateObtentionCertificat?.isValid() ? formation.dateObtentionCertificat.toJSON() : undefined,
      dateExpirationCertificat: formation.dateExpirationCertificat?.isValid() ? formation.dateExpirationCertificat.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateObtentionCertificat = res.body.dateObtentionCertificat ? dayjs(res.body.dateObtentionCertificat) : undefined;
      res.body.dateExpirationCertificat = res.body.dateExpirationCertificat ? dayjs(res.body.dateExpirationCertificat) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((formation: IFormation) => {
        formation.dateObtentionCertificat = formation.dateObtentionCertificat ? dayjs(formation.dateObtentionCertificat) : undefined;
        formation.dateExpirationCertificat = formation.dateExpirationCertificat ? dayjs(formation.dateExpirationCertificat) : undefined;
      });
    }
    return res;
  }
}
