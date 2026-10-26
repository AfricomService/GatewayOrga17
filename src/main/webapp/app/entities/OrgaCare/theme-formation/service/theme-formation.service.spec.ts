import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IThemeFormation, ThemeFormation } from '../theme-formation.model';

import { ThemeFormationService } from './theme-formation.service';

describe('ThemeFormation Service', () => {
  let service: ThemeFormationService;
  let httpMock: HttpTestingController;
  let elemDefault: IThemeFormation;
  let expectedResult: IThemeFormation | IThemeFormation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(ThemeFormationService);
    httpMock = TestBed.inject(HttpTestingController);

    elemDefault = {
      id: 0,
      theme: 'AAAAAAA',
      cout: 0,
      duree_validite_certificat: 0,
      notifier_expiration_avant: 0,
      duree_anticipation_utilisateur: 0,
      cout_formation_individuelle: 0,
      status: 'AAAAAAA',
      comments: 'AAAAAAA',
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

    it('should create a ThemeFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.create(new ThemeFormation()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ThemeFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          theme: 'BBBBBB',
          cout: 1,
          duree_validite_certificat: 1,
          notifier_expiration_avant: 1,
          duree_anticipation_utilisateur: 1,
          cout_formation_individuelle: 1,
          status: 'BBBBBB',
          comments: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign({}, returnedFromService);

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ThemeFormation', () => {
      const patchObject = Object.assign(
        {
          notifier_expiration_avant: 1,
          duree_anticipation_utilisateur: 1,
          cout_formation_individuelle: 1,
        },
        new ThemeFormation()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign({}, returnedFromService);

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ThemeFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          theme: 'BBBBBB',
          cout: 1,
          duree_validite_certificat: 1,
          notifier_expiration_avant: 1,
          duree_anticipation_utilisateur: 1,
          cout_formation_individuelle: 1,
          status: 'BBBBBB',
          comments: 'BBBBBB',
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

    it('should delete a ThemeFormation', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addThemeFormationToCollectionIfMissing', () => {
      it('should add a ThemeFormation to an empty array', () => {
        const themeFormation: IThemeFormation = { id: 123 };
        expectedResult = service.addThemeFormationToCollectionIfMissing([], themeFormation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(themeFormation);
      });

      it('should not add a ThemeFormation to an array that contains it', () => {
        const themeFormation: IThemeFormation = { id: 123 };
        const themeFormationCollection: IThemeFormation[] = [
          {
            ...themeFormation,
          },
          { id: 456 },
        ];
        expectedResult = service.addThemeFormationToCollectionIfMissing(themeFormationCollection, themeFormation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ThemeFormation to an array that doesn't contain it", () => {
        const themeFormation: IThemeFormation = { id: 123 };
        const themeFormationCollection: IThemeFormation[] = [{ id: 456 }];
        expectedResult = service.addThemeFormationToCollectionIfMissing(themeFormationCollection, themeFormation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(themeFormation);
      });

      it('should add only unique ThemeFormation to an array', () => {
        const themeFormationArray: IThemeFormation[] = [{ id: 123 }, { id: 456 }, { id: 86028 }];
        const themeFormationCollection: IThemeFormation[] = [{ id: 123 }];
        expectedResult = service.addThemeFormationToCollectionIfMissing(themeFormationCollection, ...themeFormationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const themeFormation: IThemeFormation = { id: 123 };
        const themeFormation2: IThemeFormation = { id: 456 };
        expectedResult = service.addThemeFormationToCollectionIfMissing([], themeFormation, themeFormation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(themeFormation);
        expect(expectedResult).toContain(themeFormation2);
      });

      it('should accept null and undefined values', () => {
        const themeFormation: IThemeFormation = { id: 123 };
        expectedResult = service.addThemeFormationToCollectionIfMissing([], null, themeFormation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(themeFormation);
      });

      it('should return initial array if no ThemeFormation is added', () => {
        const themeFormationCollection: IThemeFormation[] = [{ id: 123 }];
        expectedResult = service.addThemeFormationToCollectionIfMissing(themeFormationCollection, undefined, null);
        expect(expectedResult).toEqual(themeFormationCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
