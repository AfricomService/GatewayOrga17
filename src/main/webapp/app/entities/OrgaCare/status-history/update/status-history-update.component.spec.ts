jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { StatusHistoryService } from '../service/status-history.service';
import { IStatusHistory, StatusHistory } from '../status-history.model';

import { StatusHistoryUpdateComponent } from './status-history-update.component';

describe('StatusHistory Management Update Component', () => {
  let comp: StatusHistoryUpdateComponent;
  let fixture: ComponentFixture<StatusHistoryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let statusHistoryService: StatusHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [StatusHistoryUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(StatusHistoryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(StatusHistoryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    statusHistoryService = TestBed.inject(StatusHistoryService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const statusHistory: IStatusHistory = { id: 456 };

      activatedRoute.data = of({ statusHistory });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(statusHistory));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StatusHistory>>();
      const statusHistory = { id: 123 };
      jest.spyOn(statusHistoryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ statusHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: statusHistory }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(statusHistoryService.update).toHaveBeenCalledWith(statusHistory);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StatusHistory>>();
      const statusHistory = new StatusHistory();
      jest.spyOn(statusHistoryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ statusHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: statusHistory }));
      saveSubject.complete();

      // THEN
      expect(statusHistoryService.create).toHaveBeenCalledWith(statusHistory);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<StatusHistory>>();
      const statusHistory = { id: 123 };
      jest.spyOn(statusHistoryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ statusHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(statusHistoryService.update).toHaveBeenCalledWith(statusHistory);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
