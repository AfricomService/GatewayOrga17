import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISalaire, Salaire } from '../salaire.model';
import { SalaireService } from '../service/salaire.service';

@Injectable({ providedIn: 'root' })
export class SalaireRoutingResolveService implements Resolve<ISalaire> {
  constructor(protected service: SalaireService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ISalaire> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((salaire: HttpResponse<Salaire>) => {
          if (salaire.body) {
            return of(salaire.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Salaire());
  }
}
