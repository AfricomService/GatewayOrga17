import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAffectation, Affectation } from '../affectation.model';
import { AffectationService } from '../service/affectation.service';

@Injectable({ providedIn: 'root' })
export class AffectationRoutingResolveService implements Resolve<IAffectation> {
  constructor(protected service: AffectationService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IAffectation> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((affectation: HttpResponse<Affectation>) => {
          if (affectation.body) {
            return of(affectation.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Affectation());
  }
}
