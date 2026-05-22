jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ITypeContrat, TypeContrat } from '../type-contrat.model';
import { TypeContratService } from '../service/type-contrat.service';

import { TypeContratRoutingResolveService } from './type-contrat-routing-resolve.service';

describe('TypeContrat routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: TypeContratRoutingResolveService;
  let service: TypeContratService;
  let resultTypeContrat: ITypeContrat | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(TypeContratRoutingResolveService);
    service = TestBed.inject(TypeContratService);
    resultTypeContrat = undefined;
  });

  describe('resolve', () => {
    it('should return ITypeContrat returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTypeContrat = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultTypeContrat).toEqual({ id: 123 });
    });

    it('should return new ITypeContrat if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTypeContrat = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultTypeContrat).toEqual(new TypeContrat());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as TypeContrat })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultTypeContrat = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultTypeContrat).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
