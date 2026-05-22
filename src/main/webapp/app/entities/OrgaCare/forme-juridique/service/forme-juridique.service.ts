import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFormeJuridique, getFormeJuridiqueIdentifier } from '../forme-juridique.model';

export type EntityResponseType = HttpResponse<IFormeJuridique>;
export type EntityArrayResponseType = HttpResponse<IFormeJuridique[]>;

@Injectable({ providedIn: 'root' })
export class FormeJuridiqueService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/forme-juridiques', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(formeJuridique: IFormeJuridique): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formeJuridique);
    return this.http
      .post<IFormeJuridique>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(formeJuridique: IFormeJuridique): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formeJuridique);
    return this.http
      .put<IFormeJuridique>(`${this.resourceUrl}/${getFormeJuridiqueIdentifier(formeJuridique) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(formeJuridique: IFormeJuridique): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(formeJuridique);
    return this.http
      .patch<IFormeJuridique>(`${this.resourceUrl}/${getFormeJuridiqueIdentifier(formeJuridique) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IFormeJuridique>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IFormeJuridique[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addFormeJuridiqueToCollectionIfMissing(
    formeJuridiqueCollection: IFormeJuridique[],
    ...formeJuridiquesToCheck: (IFormeJuridique | null | undefined)[]
  ): IFormeJuridique[] {
    const formeJuridiques: IFormeJuridique[] = formeJuridiquesToCheck.filter(isPresent);
    if (formeJuridiques.length > 0) {
      const formeJuridiqueCollectionIdentifiers = formeJuridiqueCollection.map(
        formeJuridiqueItem => getFormeJuridiqueIdentifier(formeJuridiqueItem)!
      );
      const formeJuridiquesToAdd = formeJuridiques.filter(formeJuridiqueItem => {
        const formeJuridiqueIdentifier = getFormeJuridiqueIdentifier(formeJuridiqueItem);
        if (formeJuridiqueIdentifier == null || formeJuridiqueCollectionIdentifiers.includes(formeJuridiqueIdentifier)) {
          return false;
        }
        formeJuridiqueCollectionIdentifiers.push(formeJuridiqueIdentifier);
        return true;
      });
      return [...formeJuridiquesToAdd, ...formeJuridiqueCollection];
    }
    return formeJuridiqueCollection;
  }

  protected convertDateFromClient(formeJuridique: IFormeJuridique): IFormeJuridique {
    return Object.assign({}, formeJuridique, {
      dateCreation: formeJuridique.dateCreation?.isValid() ? formeJuridique.dateCreation.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((formeJuridique: IFormeJuridique) => {
        formeJuridique.dateCreation = formeJuridique.dateCreation ? dayjs(formeJuridique.dateCreation) : undefined;
      });
    }
    return res;
  }
}
