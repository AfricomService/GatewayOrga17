jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { ISessionFormation, SessionFormation } from '../session-formation.model';
import { SessionFormationService } from '../service/session-formation.service';

import { SessionFormationRoutingResolveService } from './session-formation-routing-resolve.service';

describe('SessionFormation routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: SessionFormationRoutingResolveService;
  let service: SessionFormationService;
  let resultSessionFormation: ISessionFormation | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(SessionFormationRoutingResolveService);
    service = TestBed.inject(SessionFormationService);
    resultSessionFormation = undefined;
  });

  describe('resolve', () => {
    it('should return ISessionFormation returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSessionFormation = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSessionFormation).toEqual({ id: 123 });
    });

    it('should return new ISessionFormation if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSessionFormation = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultSessionFormation).toEqual(new SessionFormation());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as SessionFormation })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultSessionFormation = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultSessionFormation).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
