jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { FormeJuridiqueService } from '../service/forme-juridique.service';
import { IFormeJuridique, FormeJuridique } from '../forme-juridique.model';

import { FormeJuridiqueUpdateComponent } from './forme-juridique-update.component';

describe('FormeJuridique Management Update Component', () => {
  let comp: FormeJuridiqueUpdateComponent;
  let fixture: ComponentFixture<FormeJuridiqueUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let formeJuridiqueService: FormeJuridiqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [FormeJuridiqueUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(FormeJuridiqueUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FormeJuridiqueUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    formeJuridiqueService = TestBed.inject(FormeJuridiqueService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const formeJuridique: IFormeJuridique = { id: 456 };

      activatedRoute.data = of({ formeJuridique });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(formeJuridique));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<FormeJuridique>>();
      const formeJuridique = { id: 123 };
      jest.spyOn(formeJuridiqueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formeJuridique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: formeJuridique }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(formeJuridiqueService.update).toHaveBeenCalledWith(formeJuridique);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<FormeJuridique>>();
      const formeJuridique = new FormeJuridique();
      jest.spyOn(formeJuridiqueService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formeJuridique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: formeJuridique }));
      saveSubject.complete();

      // THEN
      expect(formeJuridiqueService.create).toHaveBeenCalledWith(formeJuridique);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<FormeJuridique>>();
      const formeJuridique = { id: 123 };
      jest.spyOn(formeJuridiqueService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ formeJuridique });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(formeJuridiqueService.update).toHaveBeenCalledWith(formeJuridique);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
