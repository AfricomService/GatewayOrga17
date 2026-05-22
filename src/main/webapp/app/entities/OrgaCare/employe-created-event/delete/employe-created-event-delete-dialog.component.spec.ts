jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeCreatedEventService } from '../service/employe-created-event.service';

import { EmployeCreatedEventDeleteDialogComponent } from './employe-created-event-delete-dialog.component';

describe('EmployeCreatedEvent Management Delete Component', () => {
  let comp: EmployeCreatedEventDeleteDialogComponent;
  let fixture: ComponentFixture<EmployeCreatedEventDeleteDialogComponent>;
  let service: EmployeCreatedEventService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [EmployeCreatedEventDeleteDialogComponent],
      providers: [NgbActiveModal],
    })
      .overrideTemplate(EmployeCreatedEventDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(EmployeCreatedEventDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(EmployeCreatedEventService);
    mockActiveModal = TestBed.inject(NgbActiveModal);
  });

  describe('confirmDelete', () => {
    it('Should call delete service on confirmDelete', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({})));

        // WHEN
        comp.confirmDelete(123);
        tick();

        // THEN
        expect(service.delete).toHaveBeenCalledWith(123);
        expect(mockActiveModal.close).toHaveBeenCalledWith('deleted');
      })
    ));

    it('Should not call delete service on clear', () => {
      // GIVEN
      jest.spyOn(service, 'delete');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockActiveModal.close).not.toHaveBeenCalled();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });
});
