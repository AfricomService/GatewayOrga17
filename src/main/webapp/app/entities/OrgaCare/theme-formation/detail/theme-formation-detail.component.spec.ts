import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ThemeFormationDetailComponent } from './theme-formation-detail.component';

describe('ThemeFormation Management Detail Component', () => {
  let comp: ThemeFormationDetailComponent;
  let fixture: ComponentFixture<ThemeFormationDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThemeFormationDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ themeFormation: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ThemeFormationDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ThemeFormationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load themeFormation on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.themeFormation).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
