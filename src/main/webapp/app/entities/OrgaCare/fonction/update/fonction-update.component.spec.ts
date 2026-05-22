jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { FonctionService } from '../service/fonction.service';
import { IFonction, Fonction } from '../fonction.model';

import { FonctionUpdateComponent } from './fonction-update.component';

describe('Fonction Management Update Component', () => {
  let comp: FonctionUpdateComponent;
  let fixture: ComponentFixture<FonctionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let fonctionService: FonctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [FonctionUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(FonctionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FonctionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fonctionService = TestBed.inject(FonctionService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const fonction: IFonction = { id: 456 };

      activatedRoute.data = of({ fonction });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(fonction));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Fonction>>();
      const fonction = { id: 123 };
      jest.spyOn(fonctionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fonction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: fonction }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(fonctionService.update).toHaveBeenCalledWith(fonction);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Fonction>>();
      const fonction = new Fonction();
      jest.spyOn(fonctionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fonction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: fonction }));
      saveSubject.complete();

      // THEN
      expect(fonctionService.create).toHaveBeenCalledWith(fonction);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Fonction>>();
      const fonction = { id: 123 };
      jest.spyOn(fonctionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ fonction });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(fonctionService.update).toHaveBeenCalledWith(fonction);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
