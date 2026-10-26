import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PieceJointeDetailComponent } from './piece-jointe-detail.component';

describe('PieceJointe Management Detail Component', () => {
  let comp: PieceJointeDetailComponent;
  let fixture: ComponentFixture<PieceJointeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PieceJointeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ pieceJointe: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(PieceJointeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(PieceJointeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load pieceJointe on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.pieceJointe).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
