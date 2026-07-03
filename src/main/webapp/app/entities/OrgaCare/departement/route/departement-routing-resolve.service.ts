import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

import { IDepartement, Departement } from '../departement.model';
import { DepartementService } from '../service/departement.service';

@Injectable({ providedIn: 'root' })
export class DepartementRoutingResolveService implements Resolve<IDepartement> {
  constructor(protected service: DepartementService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IDepartement> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((departement: HttpResponse<Departement>) => {
          if (departement.body) {
            return of(departement.body);
          } else {
            console.warn('Département introuvable (body null) pour id=', id);
            this.router.navigate(['404']);
            return EMPTY;
          }
        }),
        catchError(err => {
          console.error('Erreur lors du chargement du département id=', id, err);
          this.router.navigate(['404']);
          return EMPTY;
        })
      );
    }
    return of(new Departement());
  }
}
