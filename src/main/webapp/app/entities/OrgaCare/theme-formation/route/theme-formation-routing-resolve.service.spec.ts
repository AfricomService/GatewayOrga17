jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IThemeFormation, ThemeFormation } from '../theme-formation.model';
import { ThemeFormationService } from '../service/theme-formation.service';

import { ThemeFormationRoutingResolveService } from './theme-formation-routing-resolve.service';

describe('ThemeFormation routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: ThemeFormationRoutingResolveService;
  let service: ThemeFormationService;
  let resultThemeFormation: IThemeFormation | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(ThemeFormationRoutingResolveService);
    service = TestBed.inject(ThemeFormationService);
    resultThemeFormation = undefined;
  });

  describe('resolve', () => {
    it('should return IThemeFormation returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultThemeFormation = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultThemeFormation).toEqual({ id: 123 });
    });

    it('should return new IThemeFormation if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultThemeFormation = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultThemeFormation).toEqual(new ThemeFormation());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as ThemeFormation })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultThemeFormation = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultThemeFormation).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
