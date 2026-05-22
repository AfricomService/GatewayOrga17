import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FormeJuridiqueDetailComponent } from './forme-juridique-detail.component';

describe('FormeJuridique Management Detail Component', () => {
  let comp: FormeJuridiqueDetailComponent;
  let fixture: ComponentFixture<FormeJuridiqueDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormeJuridiqueDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ formeJuridique: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(FormeJuridiqueDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FormeJuridiqueDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load formeJuridique on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.formeJuridique).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
