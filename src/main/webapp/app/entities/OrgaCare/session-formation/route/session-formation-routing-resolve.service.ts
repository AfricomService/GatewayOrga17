import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISessionFormation, SessionFormation } from '../session-formation.model';
import { SessionFormationService } from '../service/session-formation.service';

@Injectable({ providedIn: 'root' })
export class SessionFormationRoutingResolveService implements Resolve<ISessionFormation> {
  constructor(protected service: SessionFormationService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISessionFormation> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((sessionFormation: HttpResponse<SessionFormation>) => {
          if (sessionFormation.body) {
            return of(sessionFormation.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new SessionFormation());
  }
}
