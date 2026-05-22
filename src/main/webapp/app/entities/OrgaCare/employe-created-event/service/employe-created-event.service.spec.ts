import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IEmployeCreatedEvent, EmployeCreatedEvent } from '../employe-created-event.model';

import { EmployeCreatedEventService } from './employe-created-event.service';

describe('EmployeCreatedEvent Service', () => {
  let service: EmployeCreatedEventService;
  let httpMock: HttpTestingController;
  let elemDefault: IEmployeCreatedEvent;
  let expectedResult: IEmployeCreatedEvent | IEmployeCreatedEvent[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(EmployeCreatedEventService);
    httpMock = TestBed.inject(HttpTestingController);

    elemDefault = {
      id: 0,
      matricule: 'AAAAAAA',
      nomPrenom: 'AAAAAAA',
      email: 'AAAAAAA',
      userId: 0,
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign({}, elemDefault);

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a EmployeCreatedEvent', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.create(new EmployeCreatedEvent()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a EmployeCreatedEvent', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          matricule: 'BBBBBB',
          nomPrenom: 'BBBBBB',
          email: 'BBBBBB',
          userId: 1,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a EmployeCreatedEvent', () => {
      const patchObject = Object.assign(
        {
          nomPrenom: 'BBBBBB',
          email: 'BBBBBB',
          userId: 1,
        },
        new EmployeCreatedEvent()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign({}, returnedFromService);

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of EmployeCreatedEvent', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          matricule: 'BBBBBB',
          nomPrenom: 'BBBBBB',
          email: 'BBBBBB',
          userId: 1,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a EmployeCreatedEvent', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addEmployeCreatedEventToCollectionIfMissing', () => {
      it('should add a EmployeCreatedEvent to an empty array', () => {
        const employeCreatedEvent: IEmployeCreatedEvent = { id: 123 };
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing([], employeCreatedEvent);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employeCreatedEvent);
      });

      it('should not add a EmployeCreatedEvent to an array that contains it', () => {
        const employeCreatedEvent: IEmployeCreatedEvent = { id: 123 };
        const employeCreatedEventCollection: IEmployeCreatedEvent[] = [
          {
            ...employeCreatedEvent,
          },
          { id: 456 },
        ];
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing(employeCreatedEventCollection, employeCreatedEvent);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a EmployeCreatedEvent to an array that doesn't contain it", () => {
        const employeCreatedEvent: IEmployeCreatedEvent = { id: 123 };
        const employeCreatedEventCollection: IEmployeCreatedEvent[] = [{ id: 456 }];
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing(employeCreatedEventCollection, employeCreatedEvent);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employeCreatedEvent);
      });

      it('should add only unique EmployeCreatedEvent to an array', () => {
        const employeCreatedEventArray: IEmployeCreatedEvent[] = [{ id: 123 }, { id: 456 }, { id: 48901 }];
        const employeCreatedEventCollection: IEmployeCreatedEvent[] = [{ id: 123 }];
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing(employeCreatedEventCollection, ...employeCreatedEventArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const employeCreatedEvent: IEmployeCreatedEvent = { id: 123 };
        const employeCreatedEvent2: IEmployeCreatedEvent = { id: 456 };
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing([], employeCreatedEvent, employeCreatedEvent2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employeCreatedEvent);
        expect(expectedResult).toContain(employeCreatedEvent2);
      });

      it('should accept null and undefined values', () => {
        const employeCreatedEvent: IEmployeCreatedEvent = { id: 123 };
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing([], null, employeCreatedEvent, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employeCreatedEvent);
      });

      it('should return initial array if no EmployeCreatedEvent is added', () => {
        const employeCreatedEventCollection: IEmployeCreatedEvent[] = [{ id: 123 }];
        expectedResult = service.addEmployeCreatedEventToCollectionIfMissing(employeCreatedEventCollection, undefined, null);
        expect(expectedResult).toEqual(employeCreatedEventCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
