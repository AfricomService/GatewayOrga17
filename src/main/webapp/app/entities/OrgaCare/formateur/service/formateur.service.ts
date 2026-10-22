import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFormateur, getFormateurIdentifier } from '../formateur.model';

export type EntityResponseType = HttpResponse<IFormateur>;
export type EntityArrayResponseType = HttpResponse<IFormateur[]>;

@Injectable({ providedIn: 'root' })
export class FormateurService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/formateurs', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(formateur: IFormateur): Observable<EntityResponseType> {
    return this.http.post<IFormateur>(this.resourceUrl, formateur, { observe: 'response' });
  }

  update(formateur: IFormateur): Observable<EntityResponseType> {
    return this.http.put<IFormateur>(`${this.resourceUrl}/${getFormateurIdentifier(formateur) as number}`, formateur, {
      observe: 'response',
    });
  }

  partialUpdate(formateur: IFormateur): Observable<EntityResponseType> {
    return this.http.patch<IFormateur>(`${this.resourceUrl}/${getFormateurIdentifier(formateur) as number}`, formateur, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IFormateur>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFormateur[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addFormateurToCollectionIfMissing(
    formateurCollection: IFormateur[],
    ...formateursToCheck: (IFormateur | null | undefined)[]
  ): IFormateur[] {
    const formateurs: IFormateur[] = formateursToCheck.filter(isPresent);
    if (formateurs.length > 0) {
      const formateurCollectionIdentifiers = formateurCollection.map(formateurItem => getFormateurIdentifier(formateurItem)!);
      const formateursToAdd = formateurs.filter(formateurItem => {
        const formateurIdentifier = getFormateurIdentifier(formateurItem);
        if (formateurIdentifier == null || formateurCollectionIdentifiers.includes(formateurIdentifier)) {
          return false;
        }
        formateurCollectionIdentifiers.push(formateurIdentifier);
        return true;
      });
      return [...formateursToAdd, ...formateurCollection];
    }
    return formateurCollection;
  }
}
