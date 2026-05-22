import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { EmployeCreatedEventService } from '../service/employe-created-event.service';

import { EmployeCreatedEventComponent } from './employe-created-event.component';

describe('EmployeCreatedEvent Management Component', () => {
  let comp: EmployeCreatedEventComponent;
  let fixture: ComponentFixture<EmployeCreatedEventComponent>;
  let service: EmployeCreatedEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [EmployeCreatedEventComponent],
    })
      .overrideTemplate(EmployeCreatedEventComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EmployeCreatedEventComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(EmployeCreatedEventService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.employeCreatedEvents?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
