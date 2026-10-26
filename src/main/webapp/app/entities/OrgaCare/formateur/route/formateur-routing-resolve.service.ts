import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFormateur, Formateur } from '../formateur.model';
import { FormateurService } from '../service/formateur.service';

@Injectable({ providedIn: 'root' })
export class FormateurRoutingResolveService implements Resolve<IFormateur> {
  constructor(protected service: FormateurService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IFormateur> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((formateur: HttpResponse<Formateur>) => {
          if (formateur.body) {
            return of(formateur.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Formateur());
  }
}
