import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as dayjs from 'dayjs';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISessionFormation, SessionFormation } from '../session-formation.model';

import { SessionFormationService } from './session-formation.service';

describe('SessionFormation Service', () => {
  let service: SessionFormationService;
  let httpMock: HttpTestingController;
  let elemDefault: ISessionFormation;
  let expectedResult: ISessionFormation | ISessionFormation[] | boolean | null;
  let currentDate: dayjs.Dayjs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(SessionFormationService);
    httpMock = TestBed.inject(HttpTestingController);
    currentDate = dayjs();

    elemDefault = {
      id: 0,
      title: 'AAAAAAA',
      datePlanificationDu: currentDate,
      datePlanificationAu: currentDate,
      dateExecutionDu: currentDate,
      dateExecutionAu: currentDate,
      reglementaire: false,
      typeFormation: 'AAAAAAA',
      budget: 'AAAAAAA',
      coutSession: 0,
      statut: 'AAAAAAA',
      additionalInformations: 'AAAAAAA',
      dateCreation: currentDate,
      themeId: 0,
      formateurId: 0,
      societeId: 0,
      description: 'AAAAAAA',
    };
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = Object.assign(
        {
          datePlanificationDu: currentDate.format(DATE_TIME_FORMAT),
          datePlanificationAu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionAu: currentDate.format(DATE_TIME_FORMAT),
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(elemDefault);
    });

    it('should create a SessionFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 0,
          datePlanificationDu: currentDate.format(DATE_TIME_FORMAT),
          datePlanificationAu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionAu: currentDate.format(DATE_TIME_FORMAT),
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          datePlanificationDu: currentDate,
          datePlanificationAu: currentDate,
          dateExecutionDu: currentDate,
          dateExecutionAu: currentDate,
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.create(new SessionFormation()).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SessionFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          title: 'BBBBBB',
          datePlanificationDu: currentDate.format(DATE_TIME_FORMAT),
          datePlanificationAu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionAu: currentDate.format(DATE_TIME_FORMAT),
          reglementaire: true,
          typeFormation: 'BBBBBB',
          budget: 'BBBBBB',
          coutSession: 1,
          statut: 'BBBBBB',
          additionalInformations: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          themeId: 1,
          formateurId: 1,
          societeId: 1,
          description: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          datePlanificationDu: currentDate,
          datePlanificationAu: currentDate,
          dateExecutionDu: currentDate,
          dateExecutionAu: currentDate,
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.update(expected).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SessionFormation', () => {
      const patchObject = Object.assign(
        {
          title: 'BBBBBB',
          datePlanificationDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionAu: currentDate.format(DATE_TIME_FORMAT),
          reglementaire: true,
          typeFormation: 'BBBBBB',
          coutSession: 1,
          statut: 'BBBBBB',
          themeId: 1,
          formateurId: 1,
          societeId: 1,
          description: 'BBBBBB',
        },
        new SessionFormation()
      );

      const returnedFromService = Object.assign(patchObject, elemDefault);

      const expected = Object.assign(
        {
          datePlanificationDu: currentDate,
          datePlanificationAu: currentDate,
          dateExecutionDu: currentDate,
          dateExecutionAu: currentDate,
          dateCreation: currentDate,
        },
        returnedFromService
      );

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SessionFormation', () => {
      const returnedFromService = Object.assign(
        {
          id: 1,
          title: 'BBBBBB',
          datePlanificationDu: currentDate.format(DATE_TIME_FORMAT),
          datePlanificationAu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionDu: currentDate.format(DATE_TIME_FORMAT),
          dateExecutionAu: currentDate.format(DATE_TIME_FORMAT),
          reglementaire: true,
          typeFormation: 'BBBBBB',
          budget: 'BBBBBB',
          coutSession: 1,
          statut: 'BBBBBB',
          additionalInformations: 'BBBBBB',
          dateCreation: currentDate.format(DATE_TIME_FORMAT),
          themeId: 1,
          formateurId: 1,
          societeId: 1,
          description: 'BBBBBB',
        },
        elemDefault
      );

      const expected = Object.assign(
        {
          datePlanificationDu: currentDate,
          datePlanificationAu: currentDate,
          dateExecutionDu: currentDate,
          dateExecutionAu: currentDate,
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

    it('should delete a SessionFormation', () => {
      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult);
    });

    describe('addSessionFormationToCollectionIfMissing', () => {
      it('should add a SessionFormation to an empty array', () => {
        const sessionFormation: ISessionFormation = { id: 123 };
        expectedResult = service.addSessionFormationToCollectionIfMissing([], sessionFormation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(sessionFormation);
      });

      it('should not add a SessionFormation to an array that contains it', () => {
        const sessionFormation: ISessionFormation = { id: 123 };
        const sessionFormationCollection: ISessionFormation[] = [
          {
            ...sessionFormation,
          },
          { id: 456 },
        ];
        expectedResult = service.addSessionFormationToCollectionIfMissing(sessionFormationCollection, sessionFormation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SessionFormation to an array that doesn't contain it", () => {
        const sessionFormation: ISessionFormation = { id: 123 };
        const sessionFormationCollection: ISessionFormation[] = [{ id: 456 }];
        expectedResult = service.addSessionFormationToCollectionIfMissing(sessionFormationCollection, sessionFormation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(sessionFormation);
      });

      it('should add only unique SessionFormation to an array', () => {
        const sessionFormationArray: ISessionFormation[] = [{ id: 123 }, { id: 456 }, { id: 48616 }];
        const sessionFormationCollection: ISessionFormation[] = [{ id: 123 }];
        expectedResult = service.addSessionFormationToCollectionIfMissing(sessionFormationCollection, ...sessionFormationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const sessionFormation: ISessionFormation = { id: 123 };
        const sessionFormation2: ISessionFormation = { id: 456 };
        expectedResult = service.addSessionFormationToCollectionIfMissing([], sessionFormation, sessionFormation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(sessionFormation);
        expect(expectedResult).toContain(sessionFormation2);
      });

      it('should accept null and undefined values', () => {
        const sessionFormation: ISessionFormation = { id: 123 };
        expectedResult = service.addSessionFormationToCollectionIfMissing([], null, sessionFormation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(sessionFormation);
      });

      it('should return initial array if no SessionFormation is added', () => {
        const sessionFormationCollection: ISessionFormation[] = [{ id: 123 }];
        expectedResult = service.addSessionFormationToCollectionIfMissing(sessionFormationCollection, undefined, null);
        expect(expectedResult).toEqual(sessionFormationCollection);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
