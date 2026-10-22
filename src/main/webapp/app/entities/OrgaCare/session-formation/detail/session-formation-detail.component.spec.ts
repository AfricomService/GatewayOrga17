import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SessionFormationDetailComponent } from './session-formation-detail.component';

describe('SessionFormation Management Detail Component', () => {
  let comp: SessionFormationDetailComponent;
  let fixture: ComponentFixture<SessionFormationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SessionFormationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ sessionFormation: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(SessionFormationDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SessionFormationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load sessionFormation on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.sessionFormation).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
