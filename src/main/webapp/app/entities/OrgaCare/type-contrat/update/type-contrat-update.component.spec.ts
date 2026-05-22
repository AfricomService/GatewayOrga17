jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { TypeContratService } from '../service/type-contrat.service';
import { ITypeContrat, TypeContrat } from '../type-contrat.model';

import { TypeContratUpdateComponent } from './type-contrat-update.component';

describe('TypeContrat Management Update Component', () => {
  let comp: TypeContratUpdateComponent;
  let fixture: ComponentFixture<TypeContratUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let typeContratService: TypeContratService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TypeContratUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(TypeContratUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TypeContratUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    typeContratService = TestBed.inject(TypeContratService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const typeContrat: ITypeContrat = { id: 456 };

      activatedRoute.data = of({ typeContrat });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(typeContrat));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<TypeContrat>>();
      const typeContrat = { id: 123 };
      jest.spyOn(typeContratService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeContrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: typeContrat }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(typeContratService.update).toHaveBeenCalledWith(typeContrat);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<TypeContrat>>();
      const typeContrat = new TypeContrat();
      jest.spyOn(typeContratService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeContrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: typeContrat }));
      saveSubject.complete();

      // THEN
      expect(typeContratService.create).toHaveBeenCalledWith(typeContrat);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<TypeContrat>>();
      const typeContrat = { id: 123 };
      jest.spyOn(typeContratService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ typeContrat });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(typeContratService.update).toHaveBeenCalledWith(typeContrat);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
