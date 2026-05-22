jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IGroupe, Groupe } from '../groupe.model';
import { GroupeService } from '../service/groupe.service';

import { GroupeRoutingResolveService } from './groupe-routing-resolve.service';

describe('Groupe routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let routingResolveService: GroupeRoutingResolveService;
  let service: GroupeService;
  let resultGroupe: IGroupe | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Router, ActivatedRouteSnapshot],
    });
    mockRouter = TestBed.inject(Router);
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
    routingResolveService = TestBed.inject(GroupeRoutingResolveService);
    service = TestBed.inject(GroupeService);
    resultGroupe = undefined;
  });

  describe('resolve', () => {
    it('should return IGroupe returned by find', () => {
      // GIVEN
      service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultGroupe = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultGroupe).toEqual({ id: 123 });
    });

    it('should return new IGroupe if id is not provided', () => {
      // GIVEN
      service.find = jest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultGroupe = result;
      });

      // THEN
      expect(service.find).not.toBeCalled();
      expect(resultGroupe).toEqual(new Groupe());
    });

    it('should route to 404 page if data not found in server', () => {
      // GIVEN
      jest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse({ body: null as unknown as Groupe })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
        resultGroupe = result;
      });

      // THEN
      expect(service.find).toBeCalledWith(123);
      expect(resultGroupe).toEqual(undefined);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
    });
  });
});
