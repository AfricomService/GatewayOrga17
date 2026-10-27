import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISalaire, getSalaireIdentifier } from '../salaire.model';

export type EntityResponseType = HttpResponse<ISalaire>;
export type EntityArrayResponseType = HttpResponse<ISalaire[]>;

export interface ISalaireImportResult {
  total: number;
  imported: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class SalaireService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/salaires', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(salaire: ISalaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(salaire);
    return this.http
      .post<ISalaire>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(salaire: ISalaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(salaire);
    return this.http
      .put<ISalaire>(`${this.resourceUrl}/${getSalaireIdentifier(salaire) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(salaire: ISalaire): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(salaire);
    return this.http
      .patch<ISalaire>(`${this.resourceUrl}/${getSalaireIdentifier(salaire) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ISalaire>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ISalaire[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  findByPersonneId(personneId: number): Observable<ISalaire[]> {
    return this.http
      .get<ISalaire[]>(`${this.resourceUrl}/by-personne/${personneId}`)
      .pipe(map((salaires: ISalaire[]) => salaires.map(s => ({ ...s, date: s.date ? dayjs(s.date) : undefined }))));
  }

  /** Télécharge le modèle Excel (colonnes Matricule ; Salaire). */
  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.resourceUrl}/import-template`, { responseType: 'blob' });
  }

  /** Import en masse de salaires depuis un fichier .xlsx (date du salaire = aujourd'hui, côté backend). */
  importFromExcel(file: File): Observable<ISalaireImportResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ISalaireImportResult>(`${this.resourceUrl}/import`, formData);
  }

  addSalaireToCollectionIfMissing(salaireCollection: ISalaire[], ...salairesToCheck: (ISalaire | null | undefined)[]): ISalaire[] {
    const salaires: ISalaire[] = salairesToCheck.filter(isPresent);
    if (salaires.length > 0) {
      const salaireCollectionIdentifiers = salaireCollection.map(salaireItem => getSalaireIdentifier(salaireItem)!);
      const salairesToAdd = salaires.filter(salaireItem => {
        const salaireIdentifier = getSalaireIdentifier(salaireItem);
        if (salaireIdentifier == null || salaireCollectionIdentifiers.includes(salaireIdentifier)) {
          return false;
        }
        salaireCollectionIdentifiers.push(salaireIdentifier);
        return true;
      });
      return [...salairesToAdd, ...salaireCollection];
    }
    return salaireCollection;
  }

  protected convertDateFromClient(salaire: ISalaire): ISalaire {
    return Object.assign({}, salaire, {
      date: salaire.date?.isValid() ? salaire.date.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.date = res.body.date ? dayjs(res.body.date) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((salaire: ISalaire) => {
        salaire.date = salaire.date ? dayjs(salaire.date) : undefined;
      });
    }
    return res;
  }
}
