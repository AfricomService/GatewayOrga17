import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFonction, Fonction } from '../fonction.model';
import { FonctionService } from '../service/fonction.service';

@Injectable({ providedIn: 'root' })
export class FonctionRoutingResolveService implements Resolve<IFonction> {
  constructor(protected service: FonctionService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFonction> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((fonction: HttpResponse<Fonction>) => {
          if (fonction.body) {
            return of(fonction.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Fonction());
  }
}
