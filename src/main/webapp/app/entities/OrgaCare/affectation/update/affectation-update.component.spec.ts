jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { AffectationService } from '../service/affectation.service';
import { IAffectation, Affectation } from '../affectation.model';
import { IDepartement } from 'app/entities/OrgaCare/departement/departement.model';
import { DepartementService } from 'app/entities/OrgaCare/departement/service/departement.service';
import { IGroupe } from 'app/entities/OrgaCare/groupe/groupe.model';
import { GroupeService } from 'app/entities/OrgaCare/groupe/service/groupe.service';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';

import { AffectationUpdateComponent } from './affectation-update.component';

describe('Affectation Management Update Component', () => {
  let comp: AffectationUpdateComponent;
  let fixture: ComponentFixture<AffectationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let affectationService: AffectationService;
  let departementService: DepartementService;
  let groupeService: GroupeService;
  let societeService: SocieteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [AffectationUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(AffectationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(AffectationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    affectationService = TestBed.inject(AffectationService);
    departementService = TestBed.inject(DepartementService);
    groupeService = TestBed.inject(GroupeService);
    societeService = TestBed.inject(SocieteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Departement query and add missing value', () => {
      const affectation: IAffectation = { id: 456 };
      const departement: IDepartement = { id: 30296 };
      affectation.departement = departement;

      const departementCollection: IDepartement[] = [{ id: 94503 }];
      jest.spyOn(departementService, 'query').mockReturnValue(of(new HttpResponse({ body: departementCollection })));
      const additionalDepartements = [departement];
      const expectedCollection: IDepartement[] = [...additionalDepartements, ...departementCollection];
      jest.spyOn(departementService, 'addDepartementToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      expect(departementService.query).toHaveBeenCalled();
      expect(departementService.addDepartementToCollectionIfMissing).toHaveBeenCalledWith(departementCollection, ...additionalDepartements);
      expect(comp.departementsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Groupe query and add missing value', () => {
      const affectation: IAffectation = { id: 456 };
      const groupe: IGroupe = { id: 71403 };
      affectation.groupe = groupe;

      const groupeCollection: IGroupe[] = [{ id: 34167 }];
      jest.spyOn(groupeService, 'query').mockReturnValue(of(new HttpResponse({ body: groupeCollection })));
      const additionalGroupes = [groupe];
      const expectedCollection: IGroupe[] = [...additionalGroupes, ...groupeCollection];
      jest.spyOn(groupeService, 'addGroupeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      expect(groupeService.query).toHaveBeenCalled();
      expect(groupeService.addGroupeToCollectionIfMissing).toHaveBeenCalledWith(groupeCollection, ...additionalGroupes);
      expect(comp.groupesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Societe query and add missing value', () => {
      const affectation: IAffectation = { id: 456 };
      const societe: ISociete = { id: 16596 };
      affectation.societe = societe;

      const societeCollection: ISociete[] = [{ id: 97471 }];
      jest.spyOn(societeService, 'query').mockReturnValue(of(new HttpResponse({ body: societeCollection })));
      const additionalSocietes = [societe];
      const expectedCollection: ISociete[] = [...additionalSocietes, ...societeCollection];
      jest.spyOn(societeService, 'addSocieteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      expect(societeService.query).toHaveBeenCalled();
      expect(societeService.addSocieteToCollectionIfMissing).toHaveBeenCalledWith(societeCollection, ...additionalSocietes);
      expect(comp.societesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const affectation: IAffectation = { id: 456 };
      const departement: IDepartement = { id: 63438 };
      affectation.departement = departement;
      const groupe: IGroupe = { id: 92123 };
      affectation.groupe = groupe;
      const societe: ISociete = { id: 26343 };
      affectation.societe = societe;

      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(affectation));
      expect(comp.departementsSharedCollection).toContain(departement);
      expect(comp.groupesSharedCollection).toContain(groupe);
      expect(comp.societesSharedCollection).toContain(societe);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Affectation>>();
      const affectation = { id: 123 };
      jest.spyOn(affectationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affectation }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(affectationService.update).toHaveBeenCalledWith(affectation);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Affectation>>();
      const affectation = new Affectation();
      jest.spyOn(affectationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: affectation }));
      saveSubject.complete();

      // THEN
      expect(affectationService.create).toHaveBeenCalledWith(affectation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Affectation>>();
      const affectation = { id: 123 };
      jest.spyOn(affectationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ affectation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(affectationService.update).toHaveBeenCalledWith(affectation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackDepartementById', () => {
      it('Should return tracked Departement primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackDepartementById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackGroupeById', () => {
      it('Should return tracked Groupe primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackGroupeById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackSocieteById', () => {
      it('Should return tracked Societe primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackSocieteById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
