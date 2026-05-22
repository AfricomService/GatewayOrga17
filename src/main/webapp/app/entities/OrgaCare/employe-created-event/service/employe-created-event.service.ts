import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEmployeCreatedEvent, getEmployeCreatedEventIdentifier } from '../employe-created-event.model';

export type EntityResponseType = HttpResponse<IEmployeCreatedEvent>;
export type EntityArrayResponseType = HttpResponse<IEmployeCreatedEvent[]>;

@Injectable({ providedIn: 'root' })
export class EmployeCreatedEventService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/employe-created-events', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(employeCreatedEvent: IEmployeCreatedEvent): Observable<EntityResponseType> {
    return this.http.post<IEmployeCreatedEvent>(this.resourceUrl, employeCreatedEvent, { observe: 'response' });
  }

  update(employeCreatedEvent: IEmployeCreatedEvent): Observable<EntityResponseType> {
    return this.http.put<IEmployeCreatedEvent>(
      `${this.resourceUrl}/${getEmployeCreatedEventIdentifier(employeCreatedEvent) as number}`,
      employeCreatedEvent,
      { observe: 'response' }
    );
  }

  partialUpdate(employeCreatedEvent: IEmployeCreatedEvent): Observable<EntityResponseType> {
    return this.http.patch<IEmployeCreatedEvent>(
      `${this.resourceUrl}/${getEmployeCreatedEventIdentifier(employeCreatedEvent) as number}`,
      employeCreatedEvent,
      { observe: 'response' }
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IEmployeCreatedEvent>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IEmployeCreatedEvent[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addEmployeCreatedEventToCollectionIfMissing(
    employeCreatedEventCollection: IEmployeCreatedEvent[],
    ...employeCreatedEventsToCheck: (IEmployeCreatedEvent | null | undefined)[]
  ): IEmployeCreatedEvent[] {
    const employeCreatedEvents: IEmployeCreatedEvent[] = employeCreatedEventsToCheck.filter(isPresent);
    if (employeCreatedEvents.length > 0) {
      const employeCreatedEventCollectionIdentifiers = employeCreatedEventCollection.map(
        employeCreatedEventItem => getEmployeCreatedEventIdentifier(employeCreatedEventItem)!
      );
      const employeCreatedEventsToAdd = employeCreatedEvents.filter(employeCreatedEventItem => {
        const employeCreatedEventIdentifier = getEmployeCreatedEventIdentifier(employeCreatedEventItem);
        if (employeCreatedEventIdentifier == null || employeCreatedEventCollectionIdentifiers.includes(employeCreatedEventIdentifier)) {
          return false;
        }
        employeCreatedEventCollectionIdentifiers.push(employeCreatedEventIdentifier);
        return true;
      });
      return [...employeCreatedEventsToAdd, ...employeCreatedEventCollection];
    }
    return employeCreatedEventCollection;
  }
}
