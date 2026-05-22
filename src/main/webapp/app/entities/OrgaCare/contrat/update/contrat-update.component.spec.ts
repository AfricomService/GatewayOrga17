jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ContratService } from '../service/contrat.service';
import { IContrat, Contrat } from '../contrat.model';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { SocieteService } from 'app/entities/OrgaCare/societe/service/societe.service';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';
import { TypeContratService } from 'app/entities/OrgaCare/type-contrat/service/type-contrat.service';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { PersonneService } from 'app/entities/OrgaCare/personne/service/personne.service';

import { ContratUpdateComponent } from './contrat-update.component';

describe('Contrat Management Update Component', () => {
  let comp: ContratUpdateComponent;
  let fixture: ComponentFixture<ContratUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let contratService: ContratService;
  let societeService: SocieteService;
  let typeContratService: TypeContratService;
  let personneService: PersonneService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ContratUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(ContratUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ContratUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    contratService = TestBed.inject(ContratService);
    societeService = TestBed.inject(SocieteService);
    typeContratService = TestBed.inject(TypeContratService);
    personneService = TestBed.inject(PersonneService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Societe query and add missing value', () => {
      const contrat: IContrat = { id: 456 };
      const societe: ISociete = { id: 98959 };
      contrat.societe = societe;

      const societeCollection: ISociete[] = [{ id: 43002 }];
      jest.spyOn(societeService, 'query').mockReturnValue(of(new HttpResponse({ body: societeCollection })));
      const additionalSocietes = [societe];
      const expectedCollection: ISociete[] = [...additionalSocietes, ...societeCollection];
      jest.spyOn(societeService, 'addSocieteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      expect(societeService.query).toHaveBeenCalled();
      expect(societeService.addSocieteToCollectionIfMissing).toHaveBeenCalledWith(societeCollection, ...additionalSocietes);
      expect(comp.societesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call TypeContrat query and add missing value', () => {
      const contrat: IContrat = { id: 456 };
      const typeContrat: ITypeContrat = { id: 51775 };
      contrat.typeContrat = typeContrat;

      const typeContratCollection: ITypeContrat[] = [{ id: 46923 }];
      jest.spyOn(typeContratService, 'query').mockReturnValue(of(new HttpResponse({ body: typeContratCollection })));
      const additionalTypeContrats = [typeContrat];
      const expectedCollection: ITypeContrat[] = [...additionalTypeContrats, ...typeContratCollection];
      jest.spyOn(typeContratService, 'addTypeContratToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      expect(typeContratService.query).toHaveBeenCalled();
      expect(typeContratService.addTypeContratToCollectionIfMissing).toHaveBeenCalledWith(typeContratCollection, ...additionalTypeContrats);
      expect(comp.typeContratsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Personne query and add missing value', () => {
      const contrat: IContrat = { id: 456 };
      const personne: IPersonne = { id: 55050 };
      contrat.personne = personne;

      const personneCollection: IPersonne[] = [{ id: 18934 }];
      jest.spyOn(personneService, 'query').mockReturnValue(of(new HttpResponse({ body: personneCollection })));
      const additionalPersonnes = [personne];
      const expectedCollection: IPersonne[] = [...additionalPersonnes, ...personneCollection];
      jest.spyOn(personneService, 'addPersonneToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      expect(personneService.query).toHaveBeenCalled();
      expect(personneService.addPersonneToCollectionIfMissing).toHaveBeenCalledWith(personneCollection, ...additionalPersonnes);
      expect(comp.personnesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const contrat: IContrat = { id: 456 };
      const societe: ISociete = { id: 18556 };
      contrat.societe = societe;
      const typeContrat: ITypeContrat = { id: 44447 };
      contrat.typeContrat = typeContrat;
      const personne: IPersonne = { id: 20883 };
      contrat.personne = personne;

      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(contrat));
      expect(comp.societesSharedCollection).toContain(societe);
      expect(comp.typeContratsSharedCollection).toContain(typeContrat);
      expect(comp.personnesSharedCollection).toContain(personne);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Contrat>>();
      const contrat = { id: 123 };
      jest.spyOn(contratService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: contrat }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(contratService.update).toHaveBeenCalledWith(contrat);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Contrat>>();
      const contrat = new Contrat();
      jest.spyOn(contratService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: contrat }));
      saveSubject.complete();

      // THEN
      expect(contratService.create).toHaveBeenCalledWith(contrat);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Contrat>>();
      const contrat = { id: 123 };
      jest.spyOn(contratService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ contrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(contratService.update).toHaveBeenCalledWith(contrat);
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

    describe('trackTypeContratById', () => {
      it('Should return tracked TypeContrat primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackTypeContratById(0, entity);
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
});
