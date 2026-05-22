jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IAbsence, Absence } from '../absence.model';
import { AbsenceService } from '../service/absence.service';

import { AbsenceRoutingResolveService } from './absence-routing-resolve.service';

describe('Absence routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: AbsenceRoutingResolveService;
  let service: AbsenceService;
  let resultAbsence: IAbsence | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(AbsenceRoutingResolveService);
    service = TestBed.inject(AbsenceService);
    resultAbsence = undefined;
  });

  describe('resolve', () => {
    it('should return IAbsence returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultAbsence = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultAbsence).toEqual({ id: 123 });
    });

    it('should return new IAbsence if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultAbsence = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultAbsence).toEqual(new Absence());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Absence })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultAbsence = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultAbsence).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
