import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IFormateur, Formateur } from '../formateur.model';

import { FormateurService } from './formateur.service';

describe('Formateur Service', () => {
  let service: FormateurService;
  let httpMock: HttpTestingController;
  let elemDefault: IFormateur;
  let expectedResult: IFormateur | IFormateur[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(FormateurService);
    httpMock = TestBed.inject(HttpTestingController);

    elemDefault = {
      id: 0,
      nomPrenom: 'AAAAAAA',
      cin: 'AAAAAAA',
      email: 'AAAAAAA',
      telephone: 'AAAAAAA',
      status: 'AAAAAAA',
      comments: 'AAAAAAA',
      themeId: 0,
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

    it('should create a Formateur', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.create(new Formateur()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Formateur', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          nomPrenom: 'BBBBBB',
          cin: 'BBBBBB',
          email: 'BBBBBB',
          telephone: 'BBBBBB',
          status: 'BBBBBB',
          comments: 'BBBBBB',
          themeId: 1,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Formateur', () => {
      const patchObject = Object.assign(
        {
          cin: 'BBBBBB',
          status: 'BBBBBB',
          comments: 'BBBBBB',
          themeId: 1,
        },
        new Formateur()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign({}, returnedFromService);

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Formateur', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          nomPrenom: 'BBBBBB',
          cin: 'BBBBBB',
          email: 'BBBBBB',
          telephone: 'BBBBBB',
          status: 'BBBBBB',
          comments: 'BBBBBB',
          themeId: 1,
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

    it('should delete a Formateur', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addFormateurToCollectionIfMissing', () => {
      it('should add a Formateur to an empty array', () => {
        const formateur: IFormateur = { id: 123 };
        expectedResult = service.addFormateurToCollectionIfMissing([], formateur);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formateur);
      });

      it('should not add a Formateur to an array that contains it', () => {
        const formateur: IFormateur = { id: 123 };
        const formateurCollection: IFormateur[] = [
          {
            ...formateur,
          },
          { id: 456 },
        ];
        expectedResult = service.addFormateurToCollectionIfMissing(formateurCollection, formateur);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Formateur to an array that doesn't contain it", () => {
        const formateur: IFormateur = { id: 123 };
        const formateurCollection: IFormateur[] = [{ id: 456 }];
        expectedResult = service.addFormateurToCollectionIfMissing(formateurCollection, formateur);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formateur);
      });

      it('should add only unique Formateur to an array', () => {
        const formateurArray: IFormateur[] = [{ id: 123 }, { id: 456 }, { id: 34140 }];
        const formateurCollection: IFormateur[] = [{ id: 123 }];
        expectedResult = service.addFormateurToCollectionIfMissing(formateurCollection, ...formateurArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const formateur: IFormateur = { id: 123 };
        const formateur2: IFormateur = { id: 456 };
        expectedResult = service.addFormateurToCollectionIfMissing([], formateur, formateur2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(formateur);
        expect(expectedResult).toContain(formateur2);
      });

      it('should accept null and undefined values', () => {
        const formateur: IFormateur = { id: 123 };
        expectedResult = service.addFormateurToCollectionIfMissing([], null, formateur, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(formateur);
      });

      it('should return initial array if no Formateur is added', () => {
        const formateurCollection: IFormateur[] = [{ id: 123 }];
        expectedResult = service.addFormateurToCollectionIfMissing(formateurCollection, undefined, null);
        expect(expectedResult).toEqual(formateurCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
