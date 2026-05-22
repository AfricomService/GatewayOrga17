import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AffectationDetailComponent } from './affectation-detail.component';

describe('Affectation Management Detail Component', () => {
  let comp: AffectationDetailComponent;
  let fixture: ComponentFixture<AffectationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AffectationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ affectation: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(AffectationDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AffectationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load affectation on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.affectation).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
