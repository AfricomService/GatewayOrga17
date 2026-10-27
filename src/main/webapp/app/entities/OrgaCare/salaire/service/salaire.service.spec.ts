import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISalaire, Salaire } from '../salaire.model';

import { SalaireService } from './salaire.service';

describe('Salaire Service', () => {
  let service: SalaireService;
  let httpMock: HttpTestingController;
  let elemDefault: ISalaire;
  let expectedResult: ISalaire | ISalaire[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(SalaireService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      valeur: 0,
      date: currentDate,
      personneId: 0,
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          date: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a Salaire', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          date: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          date: currentDate,
        },
        returnedFromService
      );

      service.create(new Salaire()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Salaire', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          valeur: 1,
          date: currentDate.format(DATE_TIME_FORMAT),
          personneId: 1,
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          date: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Salaire', () => {
      const patchObject = Object.assign(
        {
          valeur: 1,
          personneId: 1,
        },
        new Salaire()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          date: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Salaire', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          valeur: 1,
          date: currentDate.format(DATE_TIME_FORMAT),
          personneId: 1,
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          date: currentDate,
        },
        returnedFromService
      );

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a Salaire', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addSalaireToCollectionIfMissing', () => {
      it('should add a Salaire to an empty array', () => {
        const salaire: ISalaire = { id: 123 };
        expectedResult = service.addSalaireToCollectionIfMissing([], salaire);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(salaire);
      });

      it('should not add a Salaire to an array that contains it', () => {
        const salaire: ISalaire = { id: 123 };
        const salaireCollection: ISalaire[] = [
          {
            ...salaire,
          },
          { id: 456 },
        ];
        expectedResult = service.addSalaireToCollectionIfMissing(salaireCollection, salaire);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Salaire to an array that doesn't contain it", () => {
        const salaire: ISalaire = { id: 123 };
        const salaireCollection: ISalaire[] = [{ id: 456 }];
        expectedResult = service.addSalaireToCollectionIfMissing(salaireCollection, salaire);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(salaire);
      });

      it('should add only unique Salaire to an array', () => {
        const salaireArray: ISalaire[] = [{ id: 123 }, { id: 456 }, { id: 66938 }];
        const salaireCollection: ISalaire[] = [{ id: 123 }];
        expectedResult = service.addSalaireToCollectionIfMissing(salaireCollection, ...salaireArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const salaire: ISalaire = { id: 123 };
        const salaire2: ISalaire = { id: 456 };
        expectedResult = service.addSalaireToCollectionIfMissing([], salaire, salaire2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(salaire);
        expect(expectedResult).toContain(salaire2);
      });

      it('should accept null and undefined values', () => {
        const salaire: ISalaire = { id: 123 };
        expectedResult = service.addSalaireToCollectionIfMissing([], null, salaire, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(salaire);
      });

      it('should return initial array if no Salaire is added', () => {
        const salaireCollection: ISalaire[] = [{ id: 123 }];
        expectedResult = service.addSalaireToCollectionIfMissing(salaireCollection, undefined, null);
        expect(expectedResult).toEqual(salaireCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
