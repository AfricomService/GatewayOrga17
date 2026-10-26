jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ThemeFormationService } from '../service/theme-formation.service';
import { IThemeFormation, ThemeFormation } from '../theme-formation.model';

import { ThemeFormationUpdateComponent } from './theme-formation-update.component';

describe('ThemeFormation Management Update Component', () => {
  let comp: ThemeFormationUpdateComponent;
  let fixture: ComponentFixture<ThemeFormationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let themeFormationService: ThemeFormationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ThemeFormationUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(ThemeFormationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ThemeFormationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    themeFormationService = TestBed.inject(ThemeFormationService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const themeFormation: IThemeFormation = { id: 456 };

      activatedRoute.data = of({ themeFormation });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(themeFormation));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ThemeFormation>>();
      const themeFormation = { id: 123 };
      jest.spyOn(themeFormationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ themeFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: themeFormation }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(themeFormationService.update).toHaveBeenCalledWith(themeFormation);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ThemeFormation>>();
      const themeFormation = new ThemeFormation();
      jest.spyOn(themeFormationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ themeFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: themeFormation }));
      saveSubject.complete();

      // THEN
      expect(themeFormationService.create).toHaveBeenCalledWith(themeFormation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ThemeFormation>>();
      const themeFormation = { id: 123 };
      jest.spyOn(themeFormationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ themeFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(themeFormationService.update).toHaveBeenCalledWith(themeFormation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
