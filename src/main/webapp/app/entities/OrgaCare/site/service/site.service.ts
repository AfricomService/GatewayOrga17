import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISite, getSiteIdentifier } from '../site.model';

export type EntityResponseType = HttpResponse<ISite>;
export type EntityArrayResponseType = HttpResponse<ISite[]>;

@Injectable({ providedIn: 'root' })
export class SiteService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sites', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(site: ISite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http
      .post<ISite>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(site: ISite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http
      .put<ISite>(`${this.resourceUrl}/${getSiteIdentifier(site) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(site: ISite): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(site);
    return this.http
      .patch<ISite>(`${this.resourceUrl}/${getSiteIdentifier(site) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<ISite>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<ISite[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addSiteToCollectionIfMissing(siteCollection: ISite[], ...sitesToCheck: (ISite | null | undefined)[]): ISite[] {
    const sites: ISite[] = sitesToCheck.filter(isPresent);
    if (sites.length > 0) {
      const siteCollectionIdentifiers = siteCollection.map(siteItem => getSiteIdentifier(siteItem)!);
      const sitesToAdd = sites.filter(siteItem => {
        const siteIdentifier = getSiteIdentifier(siteItem);
        if (siteIdentifier == null || siteCollectionIdentifiers.includes(siteIdentifier)) {
          return false;
        }
        siteCollectionIdentifiers.push(siteIdentifier);
        return true;
      });
      return [...sitesToAdd, ...siteCollection];
    }
    return siteCollection;
  }

  protected convertDateFromClient(site: ISite): ISite {
    return Object.assign({}, site, {
      dateCreation: site.dateCreation?.isValid() ? site.dateCreation.toJSON() : undefined,
      dateActivation: site.dateActivation?.isValid() ? site.dateActivation.toJSON() : undefined,
      dateCloture: site.dateCloture?.isValid() ? site.dateCloture.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateCreation = res.body.dateCreation ? dayjs(res.body.dateCreation) : undefined;
      res.body.dateActivation = res.body.dateActivation ? dayjs(res.body.dateActivation) : undefined;
      res.body.dateCloture = res.body.dateCloture ? dayjs(res.body.dateCloture) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((site: ISite) => {
        site.dateCreation = site.dateCreation ? dayjs(site.dateCreation) : undefined;
        site.dateActivation = site.dateActivation ? dayjs(site.dateActivation) : undefined;
        site.dateCloture = site.dateCloture ? dayjs(site.dateCloture) : undefined;
      });
    }
    return res;
  }
}
