import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FormateurDetailComponent } from './formateur-detail.component';

describe('Formateur Management Detail Component', () => {
  let comp: FormateurDetailComponent;
  let fixture: ComponentFixture<FormateurDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormateurDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ formateur: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FormateurDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FormateurDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load formateur on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.formateur).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
