jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ISalaire, Salaire } from '../salaire.model';
import { SalaireService } from '../service/salaire.service';

import { SalaireRoutingResolveService } from './salaire-routing-resolve.service';

describe('Salaire routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: SalaireRoutingResolveService;
  let service: SalaireService;
  let resultSalaire: ISalaire | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(SalaireRoutingResolveService);
    service = TestBed.inject(SalaireService);
    resultSalaire = undefined;
  });

  describe('resolve', () => {
    it('should return ISalaire returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSalaire = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSalaire).toEqual({ id: 123 });
    });

    it('should return new ISalaire if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSalaire = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultSalaire).toEqual(new Salaire());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Salaire })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSalaire = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSalaire).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
