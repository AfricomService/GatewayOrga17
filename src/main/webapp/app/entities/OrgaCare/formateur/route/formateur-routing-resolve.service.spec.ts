jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IFormateur, Formateur } from '../formateur.model';
import { FormateurService } from '../service/formateur.service';

import { FormateurRoutingResolveService } from './formateur-routing-resolve.service';

describe('Formateur routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: FormateurRoutingResolveService;
  let service: FormateurService;
  let resultFormateur: IFormateur | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(FormateurRoutingResolveService);
    service = TestBed.inject(FormateurService);
    resultFormateur = undefined;
  });

  describe('resolve', () => {
    it('should return IFormateur returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormateur = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultFormateur).toEqual({ id: 123 });
    });

    it('should return new IFormateur if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormateur = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultFormateur).toEqual(new Formateur());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Formateur })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultFormateur = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultFormateur).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
