import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FonctionDetailComponent } from './fonction-detail.component';

describe('Fonction Management Detail Component', () => {
  let comp: FonctionDetailComponent;
  let fixture: ComponentFixture<FonctionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FonctionDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ fonction: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FonctionDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FonctionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load fonction on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.fonction).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
