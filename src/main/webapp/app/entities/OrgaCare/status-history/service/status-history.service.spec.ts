import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IStatusHistory, StatusHistory } from '../status-history.model';

import { StatusHistoryService } from './status-history.service';

describe('StatusHistory Service', () => {
  let service: StatusHistoryService;
  let httpMock: HttpTestingController;
  let elemDefault: IStatusHistory;
  let expectedResult: IStatusHistory | IStatusHistory[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(StatusHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      dateTransaction: currentDate,
      dateFin: currentDate,
      loginUser: 'AAAAAAA',
      transaction: 'AAAAAAA',
      transactionReference: 'AAAAAAA',
      dataObject: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          dateTransaction: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a StatusHistory', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          dateTransaction: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateTransaction: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.create(new StatusHistory()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a StatusHistory', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          dateTransaction: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          loginUser: 'BBBBBB',
          transaction: 'BBBBBB',
          transactionReference: 'BBBBBB',
          dataObject: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateTransaction: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a StatusHistory', () => {
      const patchObject = Object.assign(
        {
          dateTransaction: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          transaction: 'BBBBBB',
        },
        new StatusHistory()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          dateTransaction: currentDate,
          dateFin: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of StatusHistory', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          dateTransaction: currentDate.format(DATE_TIME_FORMAT),
          dateFin: currentDate.format(DATE_TIME_FORMAT),
          loginUser: 'BBBBBB',
          transaction: 'BBBBBB',
          transactionReference: 'BBBBBB',
          dataObject: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateTransaction: currentDate,
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

    it('should delete a StatusHistory', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addStatusHistoryToCollectionIfMissing', () => {
      it('should add a StatusHistory to an empty array', () => {
        const statusHistory: IStatusHistory = { id: 123 };
        expectedResult = service.addStatusHistoryToCollectionIfMissing([], statusHistory);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(statusHistory);
      });

      it('should not add a StatusHistory to an array that contains it', () => {
        const statusHistory: IStatusHistory = { id: 123 };
        const statusHistoryCollection: IStatusHistory[] = [
          {
            ...statusHistory,
          },
          { id: 456 },
        ];
        expectedResult = service.addStatusHistoryToCollectionIfMissing(statusHistoryCollection, statusHistory);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a StatusHistory to an array that doesn't contain it", () => {
        const statusHistory: IStatusHistory = { id: 123 };
        const statusHistoryCollection: IStatusHistory[] = [{ id: 456 }];
        expectedResult = service.addStatusHistoryToCollectionIfMissing(statusHistoryCollection, statusHistory);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(statusHistory);
      });

      it('should add only unique StatusHistory to an array', () => {
        const statusHistoryArray: IStatusHistory[] = [{ id: 123 }, { id: 456 }, { id: 48800 }];
        const statusHistoryCollection: IStatusHistory[] = [{ id: 123 }];
        expectedResult = service.addStatusHistoryToCollectionIfMissing(statusHistoryCollection, ...statusHistoryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const statusHistory: IStatusHistory = { id: 123 };
        const statusHistory2: IStatusHistory = { id: 456 };
        expectedResult = service.addStatusHistoryToCollectionIfMissing([], statusHistory, statusHistory2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(statusHistory);
        expect(expectedResult).toContain(statusHistory2);
      });

      it('should accept null and undefined values', () => {
        const statusHistory: IStatusHistory = { id: 123 };
        expectedResult = service.addStatusHistoryToCollectionIfMissing([], null, statusHistory, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(statusHistory);
      });

      it('should return initial array if no StatusHistory is added', () => {
        const statusHistoryCollection: IStatusHistory[] = [{ id: 123 }];
        expectedResult = service.addStatusHistoryToCollectionIfMissing(statusHistoryCollection, undefined, null);
        expect(expectedResult).toEqual(statusHistoryCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
