import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IContrat, Contrat } from '../contrat.model';

import { ContratService } from './contrat.service';

describe('Contrat Service', () => {
  let service: ContratService;
  let httpMock: HttpTestingController;
  let elemDefault: IContrat;
  let expectedResult: IContrat | IContrat[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ContratService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      dateDebut: currentDate,
      dateFin: currentDate,
      type: 'AAAAAAA',
      status: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          dateDebut: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a Contrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          dateDebut: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateDebut: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.create(new Contrat()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Contrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          dateDebut: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          type: 'BBBBBB',
          status: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateDebut: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Contrat', () => {
      const patchObject = Object.assign(
        {
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          type: 'BBBBBB',
          status: 'BBBBBB',
        },
        new Contrat()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          dateDebut: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Contrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          dateDebut: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          type: 'BBBBBB',
          status: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateDebut: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a Contrat', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addContratToCollectionIfMissing', () => {
      it('should add a Contrat to an empty array', () => {
        const contrat: IContrat = { id: 123 };
        expectedResult = service.addContratToCollectionIfMissing([], contrat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(contrat);
      });

      it('should not add a Contrat to an array that contains it', () => {
        const contrat: IContrat = { id: 123 };
        const contratCollection: IContrat[] = [
          {
            ...contrat,
          },
          { id: 456 },
        ];
        expectedResult = service.addContratToCollectionIfMissing(contratCollection, contrat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Contrat to an array that doesn't contain it", () => {
        const contrat: IContrat = { id: 123 };
        const contratCollection: IContrat[] = [{ id: 456 }];
        expectedResult = service.addContratToCollectionIfMissing(contratCollection, contrat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(contrat);
      });

      it('should add only unique Contrat to an array', () => {
        const contratArray: IContrat[] = [{ id: 123 }, { id: 456 }, { id: 80081 }];
        const contratCollection: IContrat[] = [{ id: 123 }];
        expectedResult = service.addContratToCollectionIfMissing(contratCollection, ...contratArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const contrat: IContrat = { id: 123 };
        const contrat2: IContrat = { id: 456 };
        expectedResult = service.addContratToCollectionIfMissing([], contrat, contrat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(contrat);
        expect(expectedResult).toContain(contrat2);
      });

      it('should accept null and undefined values', () => {
        const contrat: IContrat = { id: 123 };
        expectedResult = service.addContratToCollectionIfMissing([], null, contrat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(contrat);
      });

      it('should return initial array if no Contrat is added', () => {
        const contratCollection: IContrat[] = [{ id: 123 }];
        expectedResult = service.addContratToCollectionIfMissing(contratCollection, undefined, null);
        expect(expectedResult).toEqual(contratCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
