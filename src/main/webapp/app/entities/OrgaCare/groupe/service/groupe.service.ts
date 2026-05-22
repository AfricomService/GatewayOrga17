import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IGroupe, getGroupeIdentifier } from '../groupe.model';

export type EntityResponseType = HttpResponse<IGroupe>;
export type EntityArrayResponseType = HttpResponse<IGroupe[]>;

@Injectable({ providedIn: 'root' })
export class GroupeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/groupes', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(groupe: IGroupe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(groupe);
    return this.http
      .post<IGroupe>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(groupe: IGroupe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(groupe);
    return this.http
      .put<IGroupe>(`${this.resourceUrl}/${getGroupeIdentifier(groupe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(groupe: IGroupe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(groupe);
    return this.http
      .patch<IGroupe>(`${this.resourceUrl}/${getGroupeIdentifier(groupe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IGroupe>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IGroupe[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addGroupeToCollectionIfMissing(groupeCollection: IGroupe[], ...groupesToCheck: (IGroupe | null | undefined)[]): IGroupe[] {
    const groupes: IGroupe[] = groupesToCheck.filter(isPresent);
    if (groupes.length > 0) {
      const groupeCollectionIdentifiers = groupeCollection.map(groupeItem => getGroupeIdentifier(groupeItem)!);
      const groupesToAdd = groupes.filter(groupeItem => {
        const groupeIdentifier = getGroupeIdentifier(groupeItem);
        if (groupeIdentifier == null || groupeCollectionIdentifiers.includes(groupeIdentifier)) {
          return false;
        }
        groupeCollectionIdentifiers.push(groupeIdentifier);
        return true;
      });
      return [...groupesToAdd, ...groupeCollection];
    }
    return groupeCollection;
  }

  protected convertDateFromClient(groupe: IGroupe): IGroupe {
    return Object.assign({}, groupe, {
      dateCreation: groupe.dateCreation?.isValid() ? groupe.dateCreation.toJSON() : undefined,
      dateActivation: groupe.dateActivation?.isValid() ? groupe.dateActivation.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateActivation = res.body.dateActivation ? dayjs(res.body.dateActivation) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((groupe: IGroupe) => {
        groupe.dateCreation = groupe.dateCreation ? dayjs(groupe.dateCreation) : undefined;
        groupe.dateActivation = groupe.dateActivation ? dayjs(groupe.dateActivation) : undefined;
      });
    }
    return res;
  }
}
