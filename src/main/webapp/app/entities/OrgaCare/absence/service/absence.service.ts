import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAbsence, getAbsenceIdentifier } from '../absence.model';

export type EntityResponseType = HttpResponse<IAbsence>;
export type EntityArrayResponseType = HttpResponse<IAbsence[]>;

@Injectable({ providedIn: 'root' })
export class AbsenceService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/absences', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(absence: IAbsence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(absence);
    return this.http
      .post<IAbsence>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(absence: IAbsence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(absence);
    return this.http
      .put<IAbsence>(`${this.resourceUrl}/${getAbsenceIdentifier(absence) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(absence: IAbsence): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(absence);
    return this.http
      .patch<IAbsence>(`${this.resourceUrl}/${getAbsenceIdentifier(absence) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IAbsence>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IAbsence[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addAbsenceToCollectionIfMissing(absenceCollection: IAbsence[], ...absencesToCheck: (IAbsence | null | undefined)[]): IAbsence[] {
    const absences: IAbsence[] = absencesToCheck.filter(isPresent);
    if (absences.length > 0) {
      const absenceCollectionIdentifiers = absenceCollection.map(absenceItem => getAbsenceIdentifier(absenceItem)!);
      const absencesToAdd = absences.filter(absenceItem => {
        const absenceIdentifier = getAbsenceIdentifier(absenceItem);
        if (absenceIdentifier == null || absenceCollectionIdentifiers.includes(absenceIdentifier)) {
          return false;
        }
        absenceCollectionIdentifiers.push(absenceIdentifier);
        return true;
      });
      return [...absencesToAdd, ...absenceCollection];
    }
    return absenceCollection;
  }

  protected convertDateFromClient(absence: IAbsence): IAbsence {
    return Object.assign({}, absence, {
      dateCreation: absence.dateCreation?.isValid() ? absence.dateCreation.toJSON() : undefined,
      dateDebut: absence.dateDebut?.isValid() ? absence.dateDebut.toJSON() : undefined,
      dateFin: absence.dateFin?.isValid() ? absence.dateFin.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateDebut = res.body.dateDebut ? dayjs(res.body.dateDebut) : undefined;
      res.body.dateFin = res.body.dateFin ? dayjs(res.body.dateFin) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((absence: IAbsence) => {
        absence.dateCreation = absence.dateCreation ? dayjs(absence.dateCreation) : undefined;
        absence.dateDebut = absence.dateDebut ? dayjs(absence.dateDebut) : undefined;
        absence.dateFin = absence.dateFin ? dayjs(absence.dateFin) : undefined;
      });
    }
    return res;
  }
}
