import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITypeContrat, TypeContrat } from '../type-contrat.model';

import { TypeContratService } from './type-contrat.service';

describe('TypeContrat Service', () => {
  let service: TypeContratService;
  let httpMock: HttpTestingController;
  let elemDefault: ITypeContrat;
  let expectedResult: ITypeContrat | ITypeContrat[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(TypeContratService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      nom: 'AAAAAAA',
      abreviation: 'AAAAAAA',
      dateCreation: currentDate,
      status: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          dateCreation: currentDate.format(DATE_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a TypeContrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          dateCreation: currentDate.format(DATE_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.create(new TypeContrat()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TypeContrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          nom: 'BBBBBB',
          abreviation: 'BBBBBB',
          dateCreation: currentDate.format(DATE_FORMAT),
          status: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TypeContrat', () => {
      const patchObject = Object.assign(
        {
          dateCreation: currentDate.format(DATE_FORMAT),
        },
        new TypeContrat()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TypeContrat', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          nom: 'BBBBBB',
          abreviation: 'BBBBBB',
          dateCreation: currentDate.format(DATE_FORMAT),
          status: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toContainEqual(expected);
    });

    it('should delete a TypeContrat', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addTypeContratToCollectionIfMissing', () => {
      it('should add a TypeContrat to an empty array', () => {
        const typeContrat: ITypeContrat = { id: 123 };
        expectedResult = service.addTypeContratToCollectionIfMissing([], typeContrat);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(typeContrat);
      });

      it('should not add a TypeContrat to an array that contains it', () => {
        const typeContrat: ITypeContrat = { id: 123 };
        const typeContratCollection: ITypeContrat[] = [
          {
            ...typeContrat,
          },
          { id: 456 },
        ];
        expectedResult = service.addTypeContratToCollectionIfMissing(typeContratCollection, typeContrat);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TypeContrat to an array that doesn't contain it", () => {
        const typeContrat: ITypeContrat = { id: 123 };
        const typeContratCollection: ITypeContrat[] = [{ id: 456 }];
        expectedResult = service.addTypeContratToCollectionIfMissing(typeContratCollection, typeContrat);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(typeContrat);
      });

      it('should add only unique TypeContrat to an array', () => {
        const typeContratArray: ITypeContrat[] = [{ id: 123 }, { id: 456 }, { id: 72996 }];
        const typeContratCollection: ITypeContrat[] = [{ id: 123 }];
        expectedResult = service.addTypeContratToCollectionIfMissing(typeContratCollection, ...typeContratArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const typeContrat: ITypeContrat = { id: 123 };
        const typeContrat2: ITypeContrat = { id: 456 };
        expectedResult = service.addTypeContratToCollectionIfMissing([], typeContrat, typeContrat2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(typeContrat);
        expect(expectedResult).toContain(typeContrat2);
      });

      it('should accept null and undefined values', () => {
        const typeContrat: ITypeContrat = { id: 123 };
        expectedResult = service.addTypeContratToCollectionIfMissing([], null, typeContrat, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(typeContrat);
      });

      it('should return initial array if no TypeContrat is added', () => {
        const typeContratCollection: ITypeContrat[] = [{ id: 123 }];
        expectedResult = service.addTypeContratToCollectionIfMissing(typeContratCollection, undefined, null);
        expect(expectedResult).toEqual(typeContratCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
