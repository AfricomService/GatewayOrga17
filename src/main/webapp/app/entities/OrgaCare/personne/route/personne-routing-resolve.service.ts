import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPersonne, Personne } from '../personne.model';
import { PersonneService } from '../service/personne.service';

@Injectable({ providedIn: 'root' })
export class PersonneRoutingResolveService implements Resolve<IPersonne> {
  constructor(protected service: PersonneService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPersonne> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((personne: HttpResponse<Personne>) => {
          if (personne.body) {
            return of(personne.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Personne());
  }
}
