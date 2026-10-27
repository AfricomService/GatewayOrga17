import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { SalaireDetailComponent } from './salaire-detail.component';

describe('Salaire Management Detail Component', () => {
  let comp: SalaireDetailComponent;
  let fixture: ComponentFixture<SalaireDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaireDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ salaire: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(SalaireDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SalaireDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load salaire on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.salaire).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
