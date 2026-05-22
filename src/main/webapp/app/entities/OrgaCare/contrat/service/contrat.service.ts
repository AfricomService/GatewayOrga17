import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IContrat, getContratIdentifier } from '../contrat.model';

export type EntityResponseType = HttpResponse<IContrat>;
export type EntityArrayResponseType = HttpResponse<IContrat[]>;

@Injectable({ providedIn: 'root' })
export class ContratService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/contrats', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(contrat: IContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contrat);
    return this.http
      .post<IContrat>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(contrat: IContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contrat);
    return this.http
      .put<IContrat>(`${this.resourceUrl}/${getContratIdentifier(contrat) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(contrat: IContrat): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(contrat);
    return this.http
      .patch<IContrat>(`${this.resourceUrl}/${getContratIdentifier(contrat) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IContrat>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IContrat[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addContratToCollectionIfMissing(contratCollection: IContrat[], ...contratsToCheck: (IContrat | null | undefined)[]): IContrat[] {
    const contrats: IContrat[] = contratsToCheck.filter(isPresent);
    if (contrats.length > 0) {
      const contratCollectionIdentifiers = contratCollection.map(contratItem => getContratIdentifier(contratItem)!);
      const contratsToAdd = contrats.filter(contratItem => {
        const contratIdentifier = getContratIdentifier(contratItem);
        if (contratIdentifier == null || contratCollectionIdentifiers.includes(contratIdentifier)) {
          return false;
        }
        contratCollectionIdentifiers.push(contratIdentifier);
        return true;
      });
      return [...contratsToAdd, ...contratCollection];
    }
    return contratCollection;
  }

  protected convertDateFromClient(contrat: IContrat): IContrat {
    return Object.assign({}, contrat, {
      dateDebut: contrat.dateDebut?.isValid() ? contrat.dateDebut.toJSON() : undefined,
      dateFin: contrat.dateFin?.isValid() ? contrat.dateFin.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateDebut = res.body.dateDebut ? dayjs(res.body.dateDebut) : undefined;
      res.body.dateFin = res.body.dateFin ? dayjs(res.body.dateFin) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((contrat: IContrat) => {
        contrat.dateDebut = contrat.dateDebut ? dayjs(contrat.dateDebut) : undefined;
        contrat.dateFin = contrat.dateFin ? dayjs(contrat.dateFin) : undefined;
      });
    }
    return res;
  }
}
