import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TypeContratDetailComponent } from './type-contrat-detail.component';

describe('TypeContrat Management Detail Component', () => {
  let comp: TypeContratDetailComponent;
  let fixture: ComponentFixture<TypeContratDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeContratDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ typeContrat: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(TypeContratDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(TypeContratDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load typeContrat on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.typeContrat).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
