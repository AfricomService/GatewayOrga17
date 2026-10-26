import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { PieceJointeService } from '../service/piece-jointe.service';

import { PieceJointeComponent } from './piece-jointe.component';

describe('PieceJointe Management Component', () => {
  let comp: PieceJointeComponent;
  let fixture: ComponentFixture<PieceJointeComponent>;
  let service: PieceJointeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PieceJointeComponent],
    })
      .overrideTemplate(PieceJointeComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PieceJointeComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PieceJointeService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        })
      )
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.pieceJointes?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });
});
