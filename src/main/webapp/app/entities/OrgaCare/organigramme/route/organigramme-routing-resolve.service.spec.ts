jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IOrganigramme, Organigramme } from '../organigramme.model';
import { OrganigrammeService } from '../service/organigramme.service';

import { OrganigrammeRoutingResolveService } from './organigramme-routing-resolve.service';

describe('Organigramme routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: OrganigrammeRoutingResolveService;
  let service: OrganigrammeService;
  let resultOrganigramme: IOrganigramme | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(OrganigrammeRoutingResolveService);
    service = TestBed.inject(OrganigrammeService);
    resultOrganigramme = undefined;
  });

  describe('resolve', () => {
    it('should return IOrganigramme returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultOrganigramme = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultOrganigramme).toEqual({ id: 123 });
    });

    it('should return new IOrganigramme if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultOrganigramme = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultOrganigramme).toEqual(new Organigramme());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Organigramme })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultOrganigramme = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultOrganigramme).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
