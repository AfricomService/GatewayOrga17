import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITypeContrat, TypeContrat } from '../type-contrat.model';
import { TypeContratService } from '../service/type-contrat.service';

@Injectable({ providedIn: 'root' })
export class TypeContratRoutingResolveService implements Resolve<ITypeContrat> {
  constructor(protected service: TypeContratService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITypeContrat> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((typeContrat: HttpResponse<TypeContrat>) => {
          if (typeContrat.body) {
            return of(typeContrat.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new TypeContrat());
  }
}
