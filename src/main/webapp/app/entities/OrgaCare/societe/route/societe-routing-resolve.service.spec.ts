jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ISociete, Societe } from '../societe.model';
import { SocieteService } from '../service/societe.service';

import { SocieteRoutingResolveService } from './societe-routing-resolve.service';

describe('Societe routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: SocieteRoutingResolveService;
  let service: SocieteService;
  let resultSociete: ISociete | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(SocieteRoutingResolveService);
    service = TestBed.inject(SocieteService);
    resultSociete = undefined;
  });

  describe('resolve', () => {
    it('should return ISociete returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSociete = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSociete).toEqual({ id: 123 });
    });

    it('should return new ISociete if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSociete = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultSociete).toEqual(new Societe());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Societe })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSociete = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSociete).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
