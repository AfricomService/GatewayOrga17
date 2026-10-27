jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SalaireService } from '../service/salaire.service';
import { ISalaire, Salaire } from '../salaire.model';

import { SalaireUpdateComponent } from './salaire-update.component';

describe('Salaire Management Update Component', () => {
  let comp: SalaireUpdateComponent;
  let fixture: ComponentFixture<SalaireUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let salaireService: SalaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SalaireUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(SalaireUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SalaireUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    salaireService = TestBed.inject(SalaireService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const salaire: ISalaire = { id: 456 };

      activatedRoute.data = of({ salaire });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(salaire));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Salaire>>();
      const salaire = { id: 123 };
      jest.spyOn(salaireService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ salaire });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: salaire }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(salaireService.update).toHaveBeenCalledWith(salaire);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Salaire>>();
      const salaire = new Salaire();
      jest.spyOn(salaireService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ salaire });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: salaire }));
      saveSubject.complete();

      // THEN
      expect(salaireService.create).toHaveBeenCalledWith(salaire);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Salaire>>();
      const salaire = { id: 123 };
      jest.spyOn(salaireService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ salaire });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(salaireService.update).toHaveBeenCalledWith(salaire);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
