import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFonction, getFonctionIdentifier } from '../fonction.model';

export type EntityResponseType = HttpResponse<IFonction>;
export type EntityArrayResponseType = HttpResponse<IFonction[]>;

@Injectable({ providedIn: 'root' })
export class FonctionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/fonctions', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(fonction: IFonction): Observable<EntityResponseType> {
    return this.http.post<IFonction>(this.resourceUrl, fonction, { observe: 'response' });
  }

  update(fonction: IFonction): Observable<EntityResponseType> {
    return this.http.put<IFonction>(`${this.resourceUrl}/${getFonctionIdentifier(fonction) as number}`, fonction, { observe: 'response' });
  }

  partialUpdate(fonction: IFonction): Observable<EntityResponseType> {
    return this.http.patch<IFonction>(`${this.resourceUrl}/${getFonctionIdentifier(fonction) as number}`, fonction, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IFonction>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFonction[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addFonctionToCollectionIfMissing(fonctionCollection: IFonction[], ...fonctionsToCheck: (IFonction | null | undefined)[]): IFonction[] {
    const fonctions: IFonction[] = fonctionsToCheck.filter(isPresent);
    if (fonctions.length > 0) {
      const fonctionCollectionIdentifiers = fonctionCollection.map(fonctionItem => getFonctionIdentifier(fonctionItem)!);
      const fonctionsToAdd = fonctions.filter(fonctionItem => {
        const fonctionIdentifier = getFonctionIdentifier(fonctionItem);
        if (fonctionIdentifier == null || fonctionCollectionIdentifiers.includes(fonctionIdentifier)) {
          return false;
        }
        fonctionCollectionIdentifiers.push(fonctionIdentifier);
        return true;
      });
      return [...fonctionsToAdd, ...fonctionCollection];
    }
    return fonctionCollection;
  }
}
