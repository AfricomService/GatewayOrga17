jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { EmployeCreatedEventService } from '../service/employe-created-event.service';
import { IEmployeCreatedEvent, EmployeCreatedEvent } from '../employe-created-event.model';

import { EmployeCreatedEventUpdateComponent } from './employe-created-event-update.component';

describe('EmployeCreatedEvent Management Update Component', () => {
  let comp: EmployeCreatedEventUpdateComponent;
  let fixture: ComponentFixture<EmployeCreatedEventUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let employeCreatedEventService: EmployeCreatedEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [EmployeCreatedEventUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(EmployeCreatedEventUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EmployeCreatedEventUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    employeCreatedEventService = TestBed.inject(EmployeCreatedEventService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const employeCreatedEvent: IEmployeCreatedEvent = { id: 456 };

      activatedRoute.data = of({ employeCreatedEvent });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(employeCreatedEvent));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<EmployeCreatedEvent>>();
      const employeCreatedEvent = { id: 123 };
      jest.spyOn(employeCreatedEventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeCreatedEvent });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employeCreatedEvent }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(employeCreatedEventService.update).toHaveBeenCalledWith(employeCreatedEvent);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<EmployeCreatedEvent>>();
      const employeCreatedEvent = new EmployeCreatedEvent();
      jest.spyOn(employeCreatedEventService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeCreatedEvent });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: employeCreatedEvent }));
      saveSubject.complete();

      // THEN
      expect(employeCreatedEventService.create).toHaveBeenCalledWith(employeCreatedEvent);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<EmployeCreatedEvent>>();
      const employeCreatedEvent = { id: 123 };
      jest.spyOn(employeCreatedEventService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ employeCreatedEvent });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(employeCreatedEventService.update).toHaveBeenCalledWith(employeCreatedEvent);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
