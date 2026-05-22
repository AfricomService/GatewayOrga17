jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { OrganigrammeService } from '../service/organigramme.service';
import { IOrganigramme, Organigramme } from '../organigramme.model';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';

import { OrganigrammeUpdateComponent } from './organigramme-update.component';

describe('Organigramme Management Update Component', () => {
  let comp: OrganigrammeUpdateComponent;
  let fixture: ComponentFixture<OrganigrammeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let organigrammeService: OrganigrammeService;
  let societeService: SocieteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [OrganigrammeUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(OrganigrammeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OrganigrammeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    organigrammeService = TestBed.inject(OrganigrammeService);
    societeService = TestBed.inject(SocieteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Societe query and add missing value', () => {
      const organigramme: IOrganigramme = { id: 456 };
      const societe: ISociete = { id: 5853 };
      organigramme.societe = societe;

      const societeCollection: ISociete[] = [{ id: 77712 }];
      jest.spyOn(societeService, 'query').mockReturnValue(of(new HttpResponse({ body: societeCollection })));
      const additionalSocietes = [societe];
      const expectedCollection: ISociete[] = [...additionalSocietes, ...societeCollection];
      jest.spyOn(societeService, 'addSocieteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ organigramme });
      comp.ngOnInit();

      expect(societeService.query).toHaveBeenCalled();
      expect(societeService.addSocieteToCollectionIfMissing).toHaveBeenCalledWith(societeCollection, ...additionalSocietes);
      expect(comp.societesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const organigramme: IOrganigramme = { id: 456 };
      const societe: ISociete = { id: 6485 };
      organigramme.societe = societe;

      activatedRoute.data = of({ organigramme });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(organigramme));
      expect(comp.societesSharedCollection).toContain(societe);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Organigramme>>();
      const organigramme = { id: 123 };
      jest.spyOn(organigrammeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ organigramme });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: organigramme }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(organigrammeService.update).toHaveBeenCalledWith(organigramme);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Organigramme>>();
      const organigramme = new Organigramme();
      jest.spyOn(organigrammeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ organigramme });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: organigramme }));
      saveSubject.complete();

      // THEN
      expect(organigrammeService.create).toHaveBeenCalledWith(organigramme);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Organigramme>>();
      const organigramme = { id: 123 };
      jest.spyOn(organigrammeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ organigramme });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(organigrammeService.update).toHaveBeenCalledWith(organigramme);
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
