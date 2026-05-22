jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { PersonneService } from '../service/personne.service';
import { IPersonne, Personne } from '../personne.model';
import { IAffectation } from 'app/entities/OrgaCare/affectation/affectation.model';
import { AffectationService } from 'app/entities/OrgaCare/affectation/service/affectation.service';
import { IGrade } from 'app/entities/OrgaCare/grade/grade.model';
import { GradeService } from 'app/entities/OrgaCare/grade/service/grade.service';
import { IFonction } from 'app/entities/OrgaCare/fonction/fonction.model';
import { FonctionService } from 'app/entities/OrgaCare/fonction/service/fonction.service';

import { PersonneUpdateComponent } from './personne-update.component';

describe('Personne Management Update Component', () => {
  let comp: PersonneUpdateComponent;
  let fixture: ComponentFixture<PersonneUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let personneService: PersonneService;
  let affectationService: AffectationService;
  let gradeService: GradeService;
  let fonctionService: FonctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PersonneUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(PersonneUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PersonneUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    personneService = TestBed.inject(PersonneService);
    affectationService = TestBed.inject(AffectationService);
    gradeService = TestBed.inject(GradeService);
    fonctionService = TestBed.inject(FonctionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Affectation query and add missing value', () => {
      const personne: IPersonne = { id: 456 };
      const affectation: IAffectation = { id: 70584 };
      personne.affectation = affectation;

      const affectationCollection: IAffectation[] = [{ id: 89456 }];
      jest.spyOn(affectationService, 'query').mockReturnValue(of(new HttpResponse({ body: affectationCollection })));
      const additionalAffectations = [affectation];
      const expectedCollection: IAffectation[] = [...additionalAffectations, ...affectationCollection];
      jest.spyOn(affectationService, 'addAffectationToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      expect(affectationService.query).toHaveBeenCalled();
      expect(affectationService.addAffectationToCollectionIfMissing).toHaveBeenCalledWith(affectationCollection, ...additionalAffectations);
      expect(comp.affectationsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Grade query and add missing value', () => {
      const personne: IPersonne = { id: 456 };
      const grade: IGrade = { id: 98617 };
      personne.grade = grade;

      const gradeCollection: IGrade[] = [{ id: 5512 }];
      jest.spyOn(gradeService, 'query').mockReturnValue(of(new HttpResponse({ body: gradeCollection })));
      const additionalGrades = [grade];
      const expectedCollection: IGrade[] = [...additionalGrades, ...gradeCollection];
      jest.spyOn(gradeService, 'addGradeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      expect(gradeService.query).toHaveBeenCalled();
      expect(gradeService.addGradeToCollectionIfMissing).toHaveBeenCalledWith(gradeCollection, ...additionalGrades);
      expect(comp.gradesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Fonction query and add missing value', () => {
      const personne: IPersonne = { id: 456 };
      const fonction: IFonction = { id: 27479 };
      personne.fonction = fonction;

      const fonctionCollection: IFonction[] = [{ id: 91074 }];
      jest.spyOn(fonctionService, 'query').mockReturnValue(of(new HttpResponse({ body: fonctionCollection })));
      const additionalFonctions = [fonction];
      const expectedCollection: IFonction[] = [...additionalFonctions, ...fonctionCollection];
      jest.spyOn(fonctionService, 'addFonctionToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      expect(fonctionService.query).toHaveBeenCalled();
      expect(fonctionService.addFonctionToCollectionIfMissing).toHaveBeenCalledWith(fonctionCollection, ...additionalFonctions);
      expect(comp.fonctionsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const personne: IPersonne = { id: 456 };
      const affectation: IAffectation = { id: 55901 };
      personne.affectation = affectation;
      const grade: IGrade = { id: 63378 };
      personne.grade = grade;
      const fonction: IFonction = { id: 82393 };
      personne.fonction = fonction;

      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(personne));
      expect(comp.affectationsSharedCollection).toContain(affectation);
      expect(comp.gradesSharedCollection).toContain(grade);
      expect(comp.fonctionsSharedCollection).toContain(fonction);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Personne>>();
      const personne = { id: 123 };
      jest.spyOn(personneService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: personne }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(personneService.update).toHaveBeenCalledWith(personne);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Personne>>();
      const personne = new Personne();
      jest.spyOn(personneService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: personne }));
      saveSubject.complete();

      // THEN
      expect(personneService.create).toHaveBeenCalledWith(personne);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Personne>>();
      const personne = { id: 123 };
      jest.spyOn(personneService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ personne });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(personneService.update).toHaveBeenCalledWith(personne);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackAffectationById', () => {
      it('Should return tracked Affectation primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackAffectationById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackGradeById', () => {
      it('Should return tracked Grade primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackGradeById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });

    describe('trackFonctionById', () => {
      it('Should return tracked Fonction primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackFonctionById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
