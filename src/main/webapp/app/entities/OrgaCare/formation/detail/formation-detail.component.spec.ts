import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FormationDetailComponent } from './formation-detail.component';

describe('Formation Management Detail Component', () => {
  let comp: FormationDetailComponent;
  let fixture: ComponentFixture<FormationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ formation: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FormationDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FormationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load formation on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.formation).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
