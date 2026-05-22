jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { DepartementService } from '../service/departement.service';
import { IDepartement, Departement } from '../departement.model';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';
import { ISite } from 'app/entities/OrgaCare/site/site.model';
import { SiteService } from 'app/entities/OrgaCare/site/service/site.service';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneService } from 'app/entities/OrgaCare/personne/service/personne.service';

import { DepartementUpdateComponent } from './departement-update.component';

describe('Departement Management Update Component', () => {
  let comp: DepartementUpdateComponent;
  let fixture: ComponentFixture<DepartementUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let departementService: DepartementService;
  let organigrammeService: OrganigrammeService;
  let siteService: SiteService;
  let personneService: PersonneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DepartementUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(DepartementUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DepartementUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    departementService = TestBed.inject(DepartementService);
    organigrammeService = TestBed.inject(OrganigrammeService);
    siteService = TestBed.inject(SiteService);
    personneService = TestBed.inject(PersonneService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Organigramme query and add missing value', () => {
      const departement: IDepartement = { id: 456 };
      const organigramme: IOrganigramme = { id: 86321 };
      departement.organigramme = organigramme;

      const organigrammeCollection: IOrganigramme[] = [{ id: 1979 }];
      jest.spyOn(organigrammeService, 'query').mockReturnValue(of(new HttpResponse({ body: organigrammeCollection })));
      const additionalOrganigrammes = [organigramme];
      const expectedCollection: IOrganigramme[] = [...additionalOrganigrammes, ...organigrammeCollection];
      jest.spyOn(organigrammeService, 'addOrganigrammeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      expect(organigrammeService.query).toHaveBeenCalled();
      expect(organigrammeService.addOrganigrammeToCollectionIfMissing).toHaveBeenCalledWith(
        organigrammeCollection,
        ...additionalOrganigrammes
      );
      expect(comp.organigrammesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Site query and add missing value', () => {
      const departement: IDepartement = { id: 456 };
      const site: ISite = { id: 63695 };
      departement.site = site;

      const siteCollection: ISite[] = [{ id: 8826 }];
      jest.spyOn(siteService, 'query').mockReturnValue(of(new HttpResponse({ body: siteCollection })));
      const additionalSites = [site];
      const expectedCollection: ISite[] = [...additionalSites, ...siteCollection];
      jest.spyOn(siteService, 'addSiteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      expect(siteService.query).toHaveBeenCalled();
      expect(siteService.addSiteToCollectionIfMissing).toHaveBeenCalledWith(siteCollection, ...additionalSites);
      expect(comp.sitesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Departement query and add missing value', () => {
      const departement: IDepartement = { id: 456 };
      const departementParent: IDepartement = { id: 59410 };
      departement.departementParent = departementParent;

      const departementCollection: IDepartement[] = [{ id: 72311 }];
      jest.spyOn(departementService, 'query').mockReturnValue(of(new HttpResponse({ body: departementCollection })));
      const additionalDepartements = [departementParent];
      const expectedCollection: IDepartement[] = [...additionalDepartements, ...departementCollection];
      jest.spyOn(departementService, 'addDepartementToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      expect(departementService.query).toHaveBeenCalled();
      expect(departementService.addDepartementToCollectionIfMissing).toHaveBeenCalledWith(departementCollection, ...additionalDepartements);
      expect(comp.departementsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Personne query and add missing value', () => {
      const departement: IDepartement = { id: 456 };
      const personnes: IPersonne[] = [{ id: 93837 }];
      departement.personnes = personnes;

      const personneCollection: IPersonne[] = [{ id: 56914 }];
      jest.spyOn(personneService, 'query').mockReturnValue(of(new HttpResponse({ body: personneCollection })));
      const additionalPersonnes = [...personnes];
      const expectedCollection: IPersonne[] = [...additionalPersonnes, ...personneCollection];
      jest.spyOn(personneService, 'addPersonneToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      expect(personneService.query).toHaveBeenCalled();
      expect(personneService.addPersonneToCollectionIfMissing).toHaveBeenCalledWith(personneCollection, ...additionalPersonnes);
      expect(comp.personnesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const departement: IDepartement = { id: 456 };
      const organigramme: IOrganigramme = { id: 36418 };
      departement.organigramme = organigramme;
      const site: ISite = { id: 88988 };
      departement.site = site;
      const departementParent: IDepartement = { id: 38874 };
      departement.departementParent = departementParent;
      const personnes: IPersonne = { id: 61411 };
      departement.personnes = [personnes];

      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(departement));
      expect(comp.organigrammesSharedCollection).toContain(organigramme);
      expect(comp.sitesSharedCollection).toContain(site);
      expect(comp.departementsSharedCollection).toContain(departementParent);
      expect(comp.personnesSharedCollection).toContain(personnes);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Departement>>();
      const departement = { id: 123 };
      jest.spyOn(departementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: departement }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(departementService.update).toHaveBeenCalledWith(departement);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Departement>>();
      const departement = new Departement();
      jest.spyOn(departementService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: departement }));
      saveSubject.complete();

      // THEN
      expect(departementService.create).toHaveBeenCalledWith(departement);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Departement>>();
      const departement = { id: 123 };
      jest.spyOn(departementService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ departement });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(departementService.update).toHaveBeenCalledWith(departement);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackOrganigrammeById', () => {
      it('Should return tracked Organigramme primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackOrganigrammeById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackSiteById', () => {
      it('Should return tracked Site primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackSiteById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackDepartementById', () => {
      it('Should return tracked Departement primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackDepartementById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackPersonneById', () => {
      it('Should return tracked Personne primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackPersonneById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });

  describe('Getting selected relationships', () => {
    describe('getSelectedPersonne', () => {
      it('Should return option if no Personne is selected', () => {
        const option = { id: 123 };
        const result = comp.getSelectedPersonne(option);
        expect(result === option).toEqual(true);
      });

      it('Should return selected Personne for according option', () => {
        const option = { id: 123 };
        const selected = { id: 123 };
        const selected2 = { id: 456 };
        const result = comp.getSelectedPersonne(option, [selected2, selected]);
        expect(result === selected).toEqual(true);
        expect(result === selected2).toEqual(false);
        expect(result === option).toEqual(false);
      });

      it('Should return option if this Personne is not selected', () => {
        const option = { id: 123 };
        const selected = { id: 456 };
        const result = comp.getSelectedPersonne(option, [selected]);
        expect(result === option).toEqual(true);
        expect(result === selected).toEqual(false);
      });
    });
  });
});
