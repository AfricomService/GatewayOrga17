import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AbsenceDetailComponent } from './absence-detail.component';

describe('Absence Management Detail Component', () => {
  let comp: AbsenceDetailComponent;
  let fixture: ComponentFixture<AbsenceDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbsenceDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ absence: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(AbsenceDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AbsenceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load absence on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.absence).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
