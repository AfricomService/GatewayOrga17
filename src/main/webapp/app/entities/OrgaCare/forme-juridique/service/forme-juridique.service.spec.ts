import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFormeJuridique, FormeJuridique } from '../forme-juridique.model';

import { FormeJuridiqueService } from './forme-juridique.service';

describe('FormeJuridique Service', () => {
  let service: FormeJuridiqueService;
  let httpMock: HttpTestingController;
  let elemDefault: IFormeJuridique;
  let expectedResult: IFormeJuridique | IFormeJuridique[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(FormeJuridiqueService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      abreviation: 'AAAAAAA',
      nom: 'AAAAAAA',
      dateCreation: currentDate,
      etat: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a FormeJuridique', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.create(new FormeJuridique()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FormeJuridique', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          abreviation: 'BBBBBB',
          nom: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          etat: 'BBBBBB',
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

    it('should partial update a FormeJuridique', () => {
      const patchObject = Object.assign(
        {
          abreviation: 'BBBBBB',
          nom: 'BBBBBB',
        },
        new FormeJuridique()
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

    it('should return a list of FormeJuridique', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          abreviation: 'BBBBBB',
          nom: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          etat: 'BBBBBB',
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

    it('should delete a FormeJuridique', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addFormeJuridiqueToCollectionIfMissing', () => {
      it('should add a FormeJuridique to an empty array', () => {
        const formeJuridique: IFormeJuridique = { id: 123 };
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing([], formeJuridique);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formeJuridique);
      });

      it('should not add a FormeJuridique to an array that contains it', () => {
        const formeJuridique: IFormeJuridique = { id: 123 };
        const formeJuridiqueCollection: IFormeJuridique[] = [
          {
            ...formeJuridique,
          },
          { id: 456 },
        ];
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing(formeJuridiqueCollection, formeJuridique);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FormeJuridique to an array that doesn't contain it", () => {
        const formeJuridique: IFormeJuridique = { id: 123 };
        const formeJuridiqueCollection: IFormeJuridique[] = [{ id: 456 }];
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing(formeJuridiqueCollection, formeJuridique);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formeJuridique);
      });

      it('should add only unique FormeJuridique to an array', () => {
        const formeJuridiqueArray: IFormeJuridique[] = [{ id: 123 }, { id: 456 }, { id: 10260 }];
        const formeJuridiqueCollection: IFormeJuridique[] = [{ id: 123 }];
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing(formeJuridiqueCollection, ...formeJuridiqueArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const formeJuridique: IFormeJuridique = { id: 123 };
        const formeJuridique2: IFormeJuridique = { id: 456 };
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing([], formeJuridique, formeJuridique2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formeJuridique);
        expect(expectedResult).toContain(formeJuridique2);
      });

      it('should accept null and undefined values', () => {
        const formeJuridique: IFormeJuridique = { id: 123 };
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing([], null, formeJuridique, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formeJuridique);
      });

      it('should return initial array if no FormeJuridique is added', () => {
        const formeJuridiqueCollection: IFormeJuridique[] = [{ id: 123 }];
        expectedResult = service.addFormeJuridiqueToCollectionIfMissing(formeJuridiqueCollection, undefined, null);
        expect(expectedResult).toEqual(formeJuridiqueCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
