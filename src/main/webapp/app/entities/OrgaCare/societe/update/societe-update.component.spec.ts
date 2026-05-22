jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SocieteService } from '../service/societe.service';
import { ISociete, Societe } from '../societe.model';
import { IFormeJuridique } from 'app/entities/OrgaCare/forme-juridique/forme-juridique.model';
import { FormeJuridiqueService } from 'app/entities/OrgaCare/forme-juridique/service/forme-juridique.service';

import { SocieteUpdateComponent } from './societe-update.component';

describe('Societe Management Update Component', () => {
  let comp: SocieteUpdateComponent;
  let fixture: ComponentFixture<SocieteUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let societeService: SocieteService;
  let formeJuridiqueService: FormeJuridiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SocieteUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(SocieteUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SocieteUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    societeService = TestBed.inject(SocieteService);
    formeJuridiqueService = TestBed.inject(FormeJuridiqueService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call FormeJuridique query and add missing value', () => {
      const societe: ISociete = { id: 456 };
      const formeJuridiquee: IFormeJuridique = { id: 22251 };
      societe.formeJuridiquee = formeJuridiquee;

      const formeJuridiqueCollection: IFormeJuridique[] = [{ id: 20492 }];
      jest.spyOn(formeJuridiqueService, 'query').mockReturnValue(of(new HttpResponse({ body: formeJuridiqueCollection })));
      const additionalFormeJuridiques = [formeJuridiquee];
      const expectedCollection: IFormeJuridique[] = [...additionalFormeJuridiques, ...formeJuridiqueCollection];
      jest.spyOn(formeJuridiqueService, 'addFormeJuridiqueToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ societe });
      comp.ngOnInit();

      expect(formeJuridiqueService.query).toHaveBeenCalled();
      expect(formeJuridiqueService.addFormeJuridiqueToCollectionIfMissing).toHaveBeenCalledWith(
        formeJuridiqueCollection,
        ...additionalFormeJuridiques
      );
      expect(comp.formeJuridiquesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const societe: ISociete = { id: 456 };
      const formeJuridiquee: IFormeJuridique = { id: 51141 };
      societe.formeJuridiquee = formeJuridiquee;

      activatedRoute.data = of({ societe });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(societe));
      expect(comp.formeJuridiquesSharedCollection).toContain(formeJuridiquee);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Societe>>();
      const societe = { id: 123 };
      jest.spyOn(societeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ societe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: societe }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(societeService.update).toHaveBeenCalledWith(societe);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Societe>>();
      const societe = new Societe();
      jest.spyOn(societeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ societe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: societe }));
      saveSubject.complete();

      // THEN
      expect(societeService.create).toHaveBeenCalledWith(societe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Societe>>();
      const societe = { id: 123 };
      jest.spyOn(societeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ societe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(societeService.update).toHaveBeenCalledWith(societe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackFormeJuridiqueById', () => {
      it('Should return tracked FormeJuridique primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackFormeJuridiqueById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
