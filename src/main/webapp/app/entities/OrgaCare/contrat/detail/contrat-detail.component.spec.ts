import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { ContratDetailComponent } from './contrat-detail.component';

describe('Contrat Management Detail Component', () => {
  let comp: ContratDetailComponent;
  let fixture: ComponentFixture<ContratDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContratDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ contrat: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(ContratDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ContratDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load contrat on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.contrat).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
