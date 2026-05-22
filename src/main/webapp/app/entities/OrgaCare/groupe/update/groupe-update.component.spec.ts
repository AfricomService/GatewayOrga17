jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { GroupeService } from '../service/groupe.service';
import { IGroupe, Groupe } from '../groupe.model';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { OrganigrammeService } from 'app/entities/OrgaCare/organigramme/service/organigramme.service';

import { GroupeUpdateComponent } from './groupe-update.component';

describe('Groupe Management Update Component', () => {
  let comp: GroupeUpdateComponent;
  let fixture: ComponentFixture<GroupeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let groupeService: GroupeService;
  let organigrammeService: OrganigrammeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [GroupeUpdateComponent],
      providers: [FormBuilder, ActivatedRoute],
    })
      .overrideTemplate(GroupeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(GroupeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    groupeService = TestBed.inject(GroupeService);
    organigrammeService = TestBed.inject(OrganigrammeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Organigramme query and add missing value', () => {
      const groupe: IGroupe = { id: 456 };
      const organigramme: IOrganigramme = { id: 76492 };
      groupe.organigramme = organigramme;

      const organigrammeCollection: IOrganigramme[] = [{ id: 98453 }];
      jest.spyOn(organigrammeService, 'query').mockReturnValue(of(new HttpResponse({ body: organigrammeCollection })));
      const additionalOrganigrammes = [organigramme];
      const expectedCollection: IOrganigramme[] = [...additionalOrganigrammes, ...organigrammeCollection];
      jest.spyOn(organigrammeService, 'addOrganigrammeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ groupe });
      comp.ngOnInit();

      expect(organigrammeService.query).toHaveBeenCalled();
      expect(organigrammeService.addOrganigrammeToCollectionIfMissing).toHaveBeenCalledWith(
        organigrammeCollection,
        ...additionalOrganigrammes
      );
      expect(comp.organigrammesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const groupe: IGroupe = { id: 456 };
      const organigramme: IOrganigramme = { id: 17735 };
      groupe.organigramme = organigramme;

      activatedRoute.data = of({ groupe });
      comp.ngOnInit();

      expect(comp.editForm.value).toEqual(expect.objectContaining(groupe));
      expect(comp.organigrammesSharedCollection).toContain(organigramme);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Groupe>>();
      const groupe = { id: 123 };
      jest.spyOn(groupeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ groupe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: groupe }));
      saveSubject.complete();

      // THEN
      expect(comp.previousState).toHaveBeenCalled();
      expect(groupeService.update).toHaveBeenCalledWith(groupe);
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Groupe>>();
      const groupe = new Groupe();
      jest.spyOn(groupeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ groupe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: groupe }));
      saveSubject.complete();

      // THEN
      expect(groupeService.create).toHaveBeenCalledWith(groupe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<Groupe>>();
      const groupe = { id: 123 };
      jest.spyOn(groupeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ groupe });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(groupeService.update).toHaveBeenCalledWith(groupe);
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Tracking relationships identifiers', () => {
    describe('trackOrganigrammeById', () => {
      it('Should return tracked Organigramme primary key', () => {
        const entity = { id: 123 };
        const trackResult = comp.trackOrganigrammeById(0, entity);
        expect(trackResult).toEqual(entity.id);
      });
    });
  });
});
