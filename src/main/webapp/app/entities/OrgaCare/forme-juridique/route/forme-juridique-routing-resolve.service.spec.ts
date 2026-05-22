jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IFormeJuridique, FormeJuridique } from '../forme-juridique.model';
import { FormeJuridiqueService } from '../service/forme-juridique.service';

import { FormeJuridiqueRoutingResolveService } from './forme-juridique-routing-resolve.service';

describe('FormeJuridique routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: FormeJuridiqueRoutingResolveService;
  let service: FormeJuridiqueService;
  let resultFormeJuridique: IFormeJuridique | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(FormeJuridiqueRoutingResolveService);
    service = TestBed.inject(FormeJuridiqueService);
    resultFormeJuridique = undefined;
  });

  describe('resolve', () => {
    it('should return IFormeJuridique returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormeJuridique = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultFormeJuridique).toEqual({ id: 123 });
    });

    it('should return new IFormeJuridique if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormeJuridique = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultFormeJuridique).toEqual(new FormeJuridique());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as FormeJuridique })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormeJuridique = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultFormeJuridique).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
