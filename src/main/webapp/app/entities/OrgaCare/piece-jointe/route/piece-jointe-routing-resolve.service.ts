import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPieceJointe, PieceJointe } from '../piece-jointe.model';
import { PieceJointeService } from '../service/piece-jointe.service';

@Injectable({ providedIn: 'root' })
export class PieceJointeRoutingResolveService implements Resolve<IPieceJointe> {
  constructor(protected service: PieceJointeService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPieceJointe> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((pieceJointe: HttpResponse<PieceJointe>) => {
          if (pieceJointe.body) {
            return of(pieceJointe.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new PieceJointe());
  }
}
