jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { SessionFormationService } from '../service/session-formation.service';
import { ISessionFormation, SessionFormation } from '../session-formation.model';

import { SessionFormationUpdateComponent } from './session-formation-update.component';

describe('SessionFormation Management Update Component', () => {
  let comp: SessionFormationUpdateComponent;
  let fixture: ComponentFixture<SessionFormationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let sessionFormationService: SessionFormationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [SessionFormationUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(SessionFormationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SessionFormationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    sessionFormationService = TestBed.inject(SessionFormationService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const sessionFormation: ISessionFormation = { id: 456 };

      activatedRoute.data = of({ sessionFormation });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(sessionFormation));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<SessionFormation>>();
      const sessionFormation = { id: 123 };
      jest.spyOn(sessionFormationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sessionFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: sessionFormation }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(sessionFormationService.update).toHaveBeenCalledWith(sessionFormation);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<SessionFormation>>();
      const sessionFormation = new SessionFormation();
      jest.spyOn(sessionFormationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sessionFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: sessionFormation }));
      saveSubject.complete();

      // THEN
      expect(sessionFormationService.create).toHaveBeenCalledWith(sessionFormation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<SessionFormation>>();
      const sessionFormation = { id: 123 };
      jest.spyOn(sessionFormationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ sessionFormation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(sessionFormationService.update).toHaveBeenCalledWith(sessionFormation);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
