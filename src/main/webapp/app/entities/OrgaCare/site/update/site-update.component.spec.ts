jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SiteService } from '../service/site.service';
import { ISite, Site } from '../site.model';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';

import { SiteUpdateComponent } from './site-update.component';

describe('Site Management Update Component', () => {
  let comp: SiteUpdateComponent;
  let fixture: ComponentFixture<SiteUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let siteService: SiteService;
  let societeService: SocieteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SiteUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(SiteUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SiteUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    siteService = TestBed.inject(SiteService);
    societeService = TestBed.inject(SocieteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Societe query and add missing value', () => {
      const site: ISite = { id: 456 };
      const societe: ISociete = { id: 84940 };
      site.societe = societe;

      const societeCollection: ISociete[] = [{ id: 66604 }];
      jest.spyOn(societeService, 'query').mockReturnValue(of(new HttpResponse({ body: societeCollection })));
      const additionalSocietes = [societe];
      const expectedCollection: ISociete[] = [...additionalSocietes, ...societeCollection];
      jest.spyOn(societeService, 'addSocieteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ site });
      comp.ngOnInit();

      expect(societeService.query).toHaveBeenCalled();
      expect(societeService.addSocieteToCollectionIfMissing).toHaveBeenCalledWith(societeCollection, ...additionalSocietes);
      expect(comp.societesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const site: ISite = { id: 456 };
      const societe: ISociete = { id: 58021 };
      site.societe = societe;

      activatedRoute.data = of({ site });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(site));
      expect(comp.societesSharedCollection).toContain(societe);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Site>>();
      const site = { id: 123 };
      jest.spyOn(siteService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ site });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: site }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(siteService.update).toHaveBeenCalledWith(site);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Site>>();
      const site = new Site();
      jest.spyOn(siteService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ site });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: site }));
      saveSubject.complete();

      // THEN
      expect(siteService.create).toHaveBeenCalledWith(site);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Site>>();
      const site = { id: 123 };
      jest.spyOn(siteService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ site });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(siteService.update).toHaveBeenCalledWith(site);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackSocieteById', () => {
      it('Should return tracked Societe primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackSocieteById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
