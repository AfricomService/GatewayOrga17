import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IThemeFormation, ThemeFormation } from '../theme-formation.model';
import { ThemeFormationService } from '../service/theme-formation.service';

@Injectable({ providedIn: 'root' })
export class ThemeFormationRoutingResolveService implements Resolve<IThemeFormation> {
  constructor(protected service: ThemeFormationService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IThemeFormation> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((themeFormation: HttpResponse<ThemeFormation>) => {
          if (themeFormation.body) {
            return of(themeFormation.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new ThemeFormation());
  }
}
