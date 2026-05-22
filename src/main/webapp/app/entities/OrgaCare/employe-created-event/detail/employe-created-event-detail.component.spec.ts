import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EmployeCreatedEventDetailComponent } from './employe-created-event-detail.component';

describe('EmployeCreatedEvent Management Detail Component', () => {
  let comp: EmployeCreatedEventDetailComponent;
  let fixture: ComponentFixture<EmployeCreatedEventDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeCreatedEventDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ employeCreatedEvent: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(EmployeCreatedEventDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(EmployeCreatedEventDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load employeCreatedEvent on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.employeCreatedEvent).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
