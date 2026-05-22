import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { Etat } from 'app/entities/enumerations/etat.model';
import { IOrganigramme, Organigramme } from '../organigramme.model';

import { OrganigrammeService } from './organigramme.service';

describe('Organigramme Service', () => {
  let service: OrganigrammeService;
  let httpMock: HttpTestingController;
  let elemDefault: IOrganigramme;
  let expectedResult: IOrganigramme | IOrganigramme[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(OrganigrammeService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      code: 'AAAAAAA',
      nom: 'AAAAAAA',
      dateCreation: currentDate,
      dateAction: currentDate,
      dateExpiration: currentDate,
      etat: Etat.DRAFT,
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          dateAction: currentDate.format(DATE_TIME_FORMAT),
          dateExpiration: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a Organigramme', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          dateAction: currentDate.format(DATE_TIME_FORMAT),
          dateExpiration: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
          dateAction: currentDate,
          dateExpiration: currentDate,
        },
        returnedFromService
      );

      service.create(new Organigramme()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Organigramme', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          code: 'BBBBBB',
          nom: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          dateAction: currentDate.format(DATE_TIME_FORMAT),
          dateExpiration: currentDate.format(DATE_TIME_FORMAT),
          etat: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
          dateAction: currentDate,
          dateExpiration: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Organigramme', () => {
      const patchObject = Object.assign(
        {
          dateExpiration: currentDate.format(DATE_TIME_FORMAT),
          etat: 'BBBBBB',
        },
        new Organigramme()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          dateCreation: currentDate,
          dateAction: currentDate,
          dateExpiration: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Organigramme', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          code: 'BBBBBB',
          nom: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          dateAction: currentDate.format(DATE_TIME_FORMAT),
          dateExpiration: currentDate.format(DATE_TIME_FORMAT),
          etat: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
          dateAction: currentDate,
          dateExpiration: currentDate,
        },
        returnedFromService
      );

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a Organigramme', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addOrganigrammeToCollectionIfMissing', () => {
      it('should add a Organigramme to an empty array', () => {
        const organigramme: IOrganigramme = { id: 123 };
        expectedResult = service.addOrganigrammeToCollectionIfMissing([], organigramme);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(organigramme);
      });

      it('should not add a Organigramme to an array that contains it', () => {
        const organigramme: IOrganigramme = { id: 123 };
        const organigrammeCollection: IOrganigramme[] = [
          {
            ...organigramme,
          },
          { id: 456 },
        ];
        expectedResult = service.addOrganigrammeToCollectionIfMissing(organigrammeCollection, organigramme);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Organigramme to an array that doesn't contain it", () => {
        const organigramme: IOrganigramme = { id: 123 };
        const organigrammeCollection: IOrganigramme[] = [{ id: 456 }];
        expectedResult = service.addOrganigrammeToCollectionIfMissing(organigrammeCollection, organigramme);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(organigramme);
      });

      it('should add only unique Organigramme to an array', () => {
        const organigrammeArray: IOrganigramme[] = [{ id: 123 }, { id: 456 }, { id: 64790 }];
        const organigrammeCollection: IOrganigramme[] = [{ id: 123 }];
        expectedResult = service.addOrganigrammeToCollectionIfMissing(organigrammeCollection, ...organigrammeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const organigramme: IOrganigramme = { id: 123 };
        const organigramme2: IOrganigramme = { id: 456 };
        expectedResult = service.addOrganigrammeToCollectionIfMissing([], organigramme, organigramme2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(organigramme);
        expect(expectedResult).toContain(organigramme2);
      });

      it('should accept null and undefined values', () => {
        const organigramme: IOrganigramme = { id: 123 };
        expectedResult = service.addOrganigrammeToCollectionIfMissing([], null, organigramme, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(organigramme);
      });

      it('should return initial array if no Organigramme is added', () => {
        const organigrammeCollection: IOrganigramme[] = [{ id: 123 }];
        expectedResult = service.addOrganigrammeToCollectionIfMissing(organigrammeCollection, undefined, null);
        expect(expectedResult).toEqual(organigrammeCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
