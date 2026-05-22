import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PersonneDetailComponent } from './personne-detail.component';

describe('Personne Management Detail Component', () => {
  let comp: PersonneDetailComponent;
  let fixture: ComponentFixture<PersonneDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonneDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ personne: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(PersonneDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(PersonneDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load personne on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.personne).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
