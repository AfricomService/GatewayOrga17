import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStatusHistory, StatusHistory } from '../status-history.model';
import { StatusHistoryService } from '../service/status-history.service';

@Injectable({ providedIn: 'root' })
export class StatusHistoryRoutingResolveService implements Resolve<IStatusHistory> {
  constructor(protected service: StatusHistoryService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStatusHistory> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((statusHistory: HttpResponse<StatusHistory>) => {
          if (statusHistory.body) {
            return of(statusHistory.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new StatusHistory());
  }
}
