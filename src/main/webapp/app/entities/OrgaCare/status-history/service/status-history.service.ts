import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStatusHistory, getStatusHistoryIdentifier } from '../status-history.model';

export type EntityResponseType = HttpResponse<IStatusHistory>;
export type EntityArrayResponseType = HttpResponse<IStatusHistory[]>;

@Injectable({ providedIn: 'root' })
export class StatusHistoryService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/status-histories', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(statusHistory: IStatusHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(statusHistory);
    return this.http
      .post<IStatusHistory>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(statusHistory: IStatusHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(statusHistory);
    return this.http
      .put<IStatusHistory>(`${this.resourceUrl}/${getStatusHistoryIdentifier(statusHistory) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(statusHistory: IStatusHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(statusHistory);
    return this.http
      .patch<IStatusHistory>(`${this.resourceUrl}/${getStatusHistoryIdentifier(statusHistory) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IStatusHistory>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IStatusHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addStatusHistoryToCollectionIfMissing(
    statusHistoryCollection: IStatusHistory[],
    ...statusHistoriesToCheck: (IStatusHistory | null | undefined)[]
  ): IStatusHistory[] {
    const statusHistories: IStatusHistory[] = statusHistoriesToCheck.filter(isPresent);
    if (statusHistories.length > 0) {
      const statusHistoryCollectionIdentifiers = statusHistoryCollection.map(
        statusHistoryItem => getStatusHistoryIdentifier(statusHistoryItem)!
      );
      const statusHistoriesToAdd = statusHistories.filter(statusHistoryItem => {
        const statusHistoryIdentifier = getStatusHistoryIdentifier(statusHistoryItem);
        if (statusHistoryIdentifier == null || statusHistoryCollectionIdentifiers.includes(statusHistoryIdentifier)) {
          return false;
        }
        statusHistoryCollectionIdentifiers.push(statusHistoryIdentifier);
        return true;
      });
      return [...statusHistoriesToAdd, ...statusHistoryCollection];
    }
    return statusHistoryCollection;
  }

  protected convertDateFromClient(statusHistory: IStatusHistory): IStatusHistory {
    return Object.assign({}, statusHistory, {
      dateTransaction: statusHistory.dateTransaction?.isValid() ? statusHistory.dateTransaction.toJSON() : undefined,
      dateFin: statusHistory.dateFin?.isValid() ? statusHistory.dateFin.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateTransaction = res.body.dateTransaction ? dayjs(res.body.dateTransaction) : undefined;
      res.body.dateFin = res.body.dateFin ? dayjs(res.body.dateFin) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((statusHistory: IStatusHistory) => {
        statusHistory.dateTransaction = statusHistory.dateTransaction ? dayjs(statusHistory.dateTransaction) : undefined;
        statusHistory.dateFin = statusHistory.dateFin ? dayjs(statusHistory.dateFin) : undefined;
      });
    }
    return res;
  }
}
