jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IPersonne, Personne } from '../personne.model';
import { PersonneService } from '../service/personne.service';

import { PersonneRoutingResolveService } from './personne-routing-resolve.service';

describe('Personne routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: PersonneRoutingResolveService;
  let service: PersonneService;
  let resultPersonne: IPersonne | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(PersonneRoutingResolveService);
    service = TestBed.inject(PersonneService);
    resultPersonne = undefined;
  });

  describe('resolve', () => {
    it('should return IPersonne returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultPersonne = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultPersonne).toEqual({ id: 123 });
    });

    it('should return new IPersonne if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultPersonne = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultPersonne).toEqual(new Personne());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Personne })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultPersonne = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultPersonne).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
