import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISessionFormation, getSessionFormationIdentifier } from '../session-formation.model';

export type EntityResponseType = HttpResponse<ISessionFormation>;
export type EntityArrayResponseType = HttpResponse<ISessionFormation[]>;

@Injectable({ providedIn: 'root' })
export class SessionFormationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/session-formations', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(sessionFormation: ISessionFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sessionFormation);
    return this.http
      .post<ISessionFormation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(sessionFormation: ISessionFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sessionFormation);
    return this.http
      .put<ISessionFormation>(`${this.resourceUrl}/${getSessionFormationIdentifier(sessionFormation) as number}`, copy, {
        observe: 'response',
      })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(sessionFormation: ISessionFormation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(sessionFormation);
    return this.http
      .patch<ISessionFormation>(`${this.resourceUrl}/${getSessionFormationIdentifier(sessionFormation) as number}`, copy, {
        observe: 'response',
      })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ISessionFormation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ISessionFormation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addSessionFormationToCollectionIfMissing(
    sessionFormationCollection: ISessionFormation[],
    ...sessionFormationsToCheck: (ISessionFormation | null | undefined)[]
  ): ISessionFormation[] {
    const sessionFormations: ISessionFormation[] = sessionFormationsToCheck.filter(isPresent);
    if (sessionFormations.length > 0) {
      const sessionFormationCollectionIdentifiers = sessionFormationCollection.map(
        sessionFormationItem => getSessionFormationIdentifier(sessionFormationItem)!
      );
      const sessionFormationsToAdd = sessionFormations.filter(sessionFormationItem => {
        const sessionFormationIdentifier = getSessionFormationIdentifier(sessionFormationItem);
        if (sessionFormationIdentifier == null || sessionFormationCollectionIdentifiers.includes(sessionFormationIdentifier)) {
          return false;
        }
        sessionFormationCollectionIdentifiers.push(sessionFormationIdentifier);
        return true;
      });
      return [...sessionFormationsToAdd, ...sessionFormationCollection];
    }
    return sessionFormationCollection;
  }

  protected convertDateFromClient(sessionFormation: ISessionFormation): ISessionFormation {
    return Object.assign({}, sessionFormation, {
      datePlanificationDu: sessionFormation.datePlanificationDu?.isValid() ? sessionFormation.datePlanificationDu.toJSON() : undefined,
      datePlanificationAu: sessionFormation.datePlanificationAu?.isValid() ? sessionFormation.datePlanificationAu.toJSON() : undefined,
      dateExecutionDu: sessionFormation.dateExecutionDu?.isValid() ? sessionFormation.dateExecutionDu.toJSON() : undefined,
      dateExecutionAu: sessionFormation.dateExecutionAu?.isValid() ? sessionFormation.dateExecutionAu.toJSON() : undefined,
      dateCreation: sessionFormation.dateCreation?.isValid() ? sessionFormation.dateCreation.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.datePlanificationDu = res.body.datePlanificationDu ? dayjs(res.body.datePlanificationDu) : undefined;
      res.body.datePlanificationAu = res.body.datePlanificationAu ? dayjs(res.body.datePlanificationAu) : undefined;
      res.body.dateExecutionDu = res.body.dateExecutionDu ? dayjs(res.body.dateExecutionDu) : undefined;
      res.body.dateExecutionAu = res.body.dateExecutionAu ? dayjs(res.body.dateExecutionAu) : undefined;
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((sessionFormation: ISessionFormation) => {
        sessionFormation.datePlanificationDu = sessionFormation.datePlanificationDu
          ? dayjs(sessionFormation.datePlanificationDu)
          : undefined;
        sessionFormation.datePlanificationAu = sessionFormation.datePlanificationAu
          ? dayjs(sessionFormation.datePlanificationAu)
          : undefined;
        sessionFormation.dateExecutionDu = sessionFormation.dateExecutionDu ? dayjs(sessionFormation.dateExecutionDu) : undefined;
        sessionFormation.dateExecutionAu = sessionFormation.dateExecutionAu ? dayjs(sessionFormation.dateExecutionAu) : undefined;
        sessionFormation.dateCreation = sessionFormation.dateCreation ? dayjs(sessionFormation.dateCreation) : undefined;
      });
    }
    return res;
  }
}
