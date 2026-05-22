import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IContrat, Contrat } from '../contrat.model';
import { ContratService } from '../service/contrat.service';

@Injectable({ providedIn: 'root' })
export class ContratRoutingResolveService implements Resolve<IContrat> {
  constructor(protected service: ContratService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IContrat> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((contrat: HttpResponse<Contrat>) => {
          if (contrat.body) {
            return of(contrat.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Contrat());
  }
}
