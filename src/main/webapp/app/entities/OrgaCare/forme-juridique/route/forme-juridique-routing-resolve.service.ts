import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFormeJuridique, FormeJuridique } from '../forme-juridique.model';
import { FormeJuridiqueService } from '../service/forme-juridique.service';

@Injectable({ providedIn: 'root' })
export class FormeJuridiqueRoutingResolveService implements Resolve<IFormeJuridique> {
  constructor(protected service: FormeJuridiqueService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFormeJuridique> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((formeJuridique: HttpResponse<FormeJuridique>) => {
          if (formeJuridique.body) {
            return of(formeJuridique.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new FormeJuridique());
  }
}
