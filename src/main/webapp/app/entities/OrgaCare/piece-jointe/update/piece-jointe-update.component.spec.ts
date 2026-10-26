jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { PieceJointeService } from '../service/piece-jointe.service';
import { IPieceJointe, PieceJointe } from '../piece-jointe.model';

import { PieceJointeUpdateComponent } from './piece-jointe-update.component';

describe('PieceJointe Management Update Component', () => {
  let comp: PieceJointeUpdateComponent;
  let fixture: ComponentFixture<PieceJointeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let pieceJointeService: PieceJointeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [PieceJointeUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(PieceJointeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PieceJointeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    pieceJointeService = TestBed.inject(PieceJointeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const pieceJointe: IPieceJointe = { id: 456 };

      activatedRoute.data = of({ pieceJointe });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(pieceJointe));
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<PieceJointe>>();
      const pieceJointe = { id: 123 };
      jest.spyOn(pieceJointeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceJointe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pieceJointe }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(pieceJointeService.update).toHaveBeenCalledWith(pieceJointe);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<PieceJointe>>();
      const pieceJointe = new PieceJointe();
      jest.spyOn(pieceJointeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceJointe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pieceJointe }));
      saveSubject.complete();

      // THEN
      expect(pieceJointeService.create).toHaveBeenCalledWith(pieceJointe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<PieceJointe>>();
      const pieceJointe = { id: 123 };
      jest.spyOn(pieceJointeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceJointe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(pieceJointeService.update).toHaveBeenCalledWith(pieceJointe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
