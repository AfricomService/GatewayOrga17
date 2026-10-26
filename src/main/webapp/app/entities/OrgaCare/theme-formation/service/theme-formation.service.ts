import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IThemeFormation, getThemeFormationIdentifier } from '../theme-formation.model';

export type EntityResponseType = HttpResponse<IThemeFormation>;
export type EntityArrayResponseType = HttpResponse<IThemeFormation[]>;

@Injectable({ providedIn: 'root' })
export class ThemeFormationService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/theme-formations', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(themeFormation: IThemeFormation): Observable<EntityResponseType> {
    return this.http.post<IThemeFormation>(this.resourceUrl, themeFormation, { observe: 'response' });
  }

  update(themeFormation: IThemeFormation): Observable<EntityResponseType> {
    return this.http.put<IThemeFormation>(`${this.resourceUrl}/${getThemeFormationIdentifier(themeFormation) as number}`, themeFormation, {
      observe: 'response',
    });
  }

  partialUpdate(themeFormation: IThemeFormation): Observable<EntityResponseType> {
    return this.http.patch<IThemeFormation>(
      `${this.resourceUrl}/${getThemeFormationIdentifier(themeFormation) as number}`,
      themeFormation,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IThemeFormation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IThemeFormation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addThemeFormationToCollectionIfMissing(
    themeFormationCollection: IThemeFormation[],
    ...themeFormationsToCheck: (IThemeFormation | null | undefined)[]
  ): IThemeFormation[] {
    const themeFormations: IThemeFormation[] = themeFormationsToCheck.filter(isPresent);
    if (themeFormations.length > 0) {
      const themeFormationCollectionIdentifiers = themeFormationCollection.map(
        themeFormationItem => getThemeFormationIdentifier(themeFormationItem)!
      );
      const themeFormationsToAdd = themeFormations.filter(themeFormationItem => {
        const themeFormationIdentifier = getThemeFormationIdentifier(themeFormationItem);
        if (themeFormationIdentifier == null || themeFormationCollectionIdentifiers.includes(themeFormationIdentifier)) {
          return false;
        }
        themeFormationCollectionIdentifiers.push(themeFormationIdentifier);
        return true;
      });
      return [...themeFormationsToAdd, ...themeFormationCollection];
    }
    return themeFormationCollection;
  }
}
