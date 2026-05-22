import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IFonction, Fonction } from '../fonction.model';

import { FonctionService } from './fonction.service';

describe('Fonction Service', () => {
  let service: FonctionService;
  let httpMock: HttpTestingController;
  let elemDefault: IFonction;
  let expectedResult: IFonction | IFonction[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(FonctionService);
    httpMock = TestBed.inject(HttpTestingController);

    elemDefault = {
      id: 0,
      code: 'AAAAAAA',
      label: 'AAAAAAA',
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

    it('should create a Fonction', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.create(new Fonction()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Fonction', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          code: 'BBBBBB',
          label: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Fonction', () => {
      const patchObject = Object.assign(
        {
          code: 'BBBBBB',
          label: 'BBBBBB',
        },
        new Fonction()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign({}, returnedFromService);

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Fonction', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          code: 'BBBBBB',
          label: 'BBBBBB',
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

    it('should delete a Fonction', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addFonctionToCollectionIfMissing', () => {
      it('should add a Fonction to an empty array', () => {
        const fonction: IFonction = { id: 123 };
        expectedResult = service.addFonctionToCollectionIfMissing([], fonction);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(fonction);
      });

      it('should not add a Fonction to an array that contains it', () => {
        const fonction: IFonction = { id: 123 };
        const fonctionCollection: IFonction[] = [
          {
            ...fonction,
          },
          { id: 456 },
        ];
        expectedResult = service.addFonctionToCollectionIfMissing(fonctionCollection, fonction);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Fonction to an array that doesn't contain it", () => {
        const fonction: IFonction = { id: 123 };
        const fonctionCollection: IFonction[] = [{ id: 456 }];
        expectedResult = service.addFonctionToCollectionIfMissing(fonctionCollection, fonction);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(fonction);
      });

      it('should add only unique Fonction to an array', () => {
        const fonctionArray: IFonction[] = [{ id: 123 }, { id: 456 }, { id: 81889 }];
        const fonctionCollection: IFonction[] = [{ id: 123 }];
        expectedResult = service.addFonctionToCollectionIfMissing(fonctionCollection, ...fonctionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const fonction: IFonction = { id: 123 };
        const fonction2: IFonction = { id: 456 };
        expectedResult = service.addFonctionToCollectionIfMissing([], fonction, fonction2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(fonction);
        expect(expectedResult).toContain(fonction2);
      });

      it('should accept null and undefined values', () => {
        const fonction: IFonction = { id: 123 };
        expectedResult = service.addFonctionToCollectionIfMissing([], null, fonction, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(fonction);
      });

      it('should return initial array if no Fonction is added', () => {
        const fonctionCollection: IFonction[] = [{ id: 123 }];
        expectedResult = service.addFonctionToCollectionIfMissing(fonctionCollection, undefined, null);
        expect(expectedResult).toEqual(fonctionCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
