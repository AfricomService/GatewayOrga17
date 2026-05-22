jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IStatusHistory, StatusHistory } from '../status-history.model';
import { StatusHistoryService } from '../service/status-history.service';

import { StatusHistoryRoutingResolveService } from './status-history-routing-resolve.service';

describe('StatusHistory routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: StatusHistoryRoutingResolveService;
  let service: StatusHistoryService;
  let resultStatusHistory: IStatusHistory | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(StatusHistoryRoutingResolveService);
    service = TestBed.inject(StatusHistoryService);
    resultStatusHistory = undefined;
  });

  describe('resolve', () => {
    it('should return IStatusHistory returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultStatusHistory = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultStatusHistory).toEqual({ id: 123 });
    });

    it('should return new IStatusHistory if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultStatusHistory = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultStatusHistory).toEqual(new StatusHistory());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as StatusHistory })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultStatusHistory = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultStatusHistory).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
