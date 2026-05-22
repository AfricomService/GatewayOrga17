import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IOrganigramme, Organigramme } from '../organigramme.model';
import { OrganigrammeService } from '../service/organigramme.service';

@Injectable({ providedIn: 'root' })
export class OrganigrammeRoutingResolveService implements Resolve<IOrganigramme> {
  constructor(protected service: OrganigrammeService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IOrganigramme> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((organigramme: HttpResponse<Organigramme>) => {
          if (organigramme.body) {
            return of(organigramme.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Organigramme());
  }
}
