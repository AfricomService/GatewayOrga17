import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITypeContrat, getTypeContratIdentifier } from '../type-contrat.model';

export type EntityResponseType = HttpResponse<ITypeContrat>;
export type EntityArrayResponseType = HttpResponse<ITypeContrat[]>;

@Injectable({ providedIn: 'root' })
export class TypeContratService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/type-contrats', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(typeContrat: ITypeContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(typeContrat);
    return this.http
      .post<ITypeContrat>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(typeContrat: ITypeContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(typeContrat);
    return this.http
      .put<ITypeContrat>(`${this.resourceUrl}/${getTypeContratIdentifier(typeContrat) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(typeContrat: ITypeContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(typeContrat);
    return this.http
      .patch<ITypeContrat>(`${this.resourceUrl}/${getTypeContratIdentifier(typeContrat) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ITypeContrat>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ITypeContrat[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addTypeContratToCollectionIfMissing(
    typeContratCollection: ITypeContrat[],
    ...typeContratsToCheck: (ITypeContrat | null | undefined)[]
  ): ITypeContrat[] {
    const typeContrats: ITypeContrat[] = typeContratsToCheck.filter(isPresent);
    if (typeContrats.length > 0) {
      const typeContratCollectionIdentifiers = typeContratCollection.map(typeContratItem => getTypeContratIdentifier(typeContratItem)!);
      const typeContratsToAdd = typeContrats.filter(typeContratItem => {
        const typeContratIdentifier = getTypeContratIdentifier(typeContratItem);
        if (typeContratIdentifier == null || typeContratCollectionIdentifiers.includes(typeContratIdentifier)) {
          return false;
        }
        typeContratCollectionIdentifiers.push(typeContratIdentifier);
        return true;
      });
      return [...typeContratsToAdd, ...typeContratCollection];
    }
    return typeContratCollection;
  }

  protected convertDateFromClient(typeContrat: ITypeContrat): ITypeContrat {
    return Object.assign({}, typeContrat, {
      dateCreation: typeContrat.dateCreation?.isValid() ? typeContrat.dateCreation.format(DATE_FORMAT) : undefined,
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
      res.body.forEach((typeContrat: ITypeContrat) => {
        typeContrat.dateCreation = typeContrat.dateCreation ? dayjs(typeContrat.dateCreation) : undefined;
      });
    }
    return res;
  }
}
