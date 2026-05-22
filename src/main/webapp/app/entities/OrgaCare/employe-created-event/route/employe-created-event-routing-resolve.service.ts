import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEmployeCreatedEvent, EmployeCreatedEvent } from '../employe-created-event.model';
import { EmployeCreatedEventService } from '../service/employe-created-event.service';

@Injectable({ providedIn: 'root' })
export class EmployeCreatedEventRoutingResolveService implements Resolve<IEmployeCreatedEvent> {
  constructor(protected service: EmployeCreatedEventService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IEmployeCreatedEvent> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((employeCreatedEvent: HttpResponse<EmployeCreatedEvent>) => {
          if (employeCreatedEvent.body) {
            return of(employeCreatedEvent.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new EmployeCreatedEvent());
  }
}
