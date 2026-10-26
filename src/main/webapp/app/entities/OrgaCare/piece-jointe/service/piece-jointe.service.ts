import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPieceJointe, getPieceJointeIdentifier } from '../piece-jointe.model';

export type EntityResponseType = HttpResponse<IPieceJointe>;
export type EntityArrayResponseType = HttpResponse<IPieceJointe[]>;

@Injectable({ providedIn: 'root' })
export class PieceJointeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/piece-jointes', 'orgacare');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(pieceJointe: IPieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .post<IPieceJointe>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(pieceJointe: IPieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .put<IPieceJointe>(`${this.resourceUrl}/${getPieceJointeIdentifier(pieceJointe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  partialUpdate(pieceJointe: IPieceJointe): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(pieceJointe);
    return this.http
      .patch<IPieceJointe>(`${this.resourceUrl}/${getPieceJointeIdentifier(pieceJointe) as number}`, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IPieceJointe>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IPieceJointe[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  // ───────── Pièces jointes d'une session de formation ─────────
  uploadForSession(file: File, sessionId: number): Observable<IPieceJointe> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', String(sessionId));
    return this.http.post<IPieceJointe>(`${this.resourceUrl}/upload-session`, formData);
  }

  findBySession(sessionId: number): Observable<IPieceJointe[]> {
    return this.http.get<IPieceJointe[]>(`${this.resourceUrl}/by-session/${sessionId}`);
  }

  // ───────── Pièces jointes d'une formation ─────────
  uploadForFormation(file: File, formationId: number): Observable<IPieceJointe> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formationId', String(formationId));
    return this.http.post<IPieceJointe>(`${this.resourceUrl}/upload-formation`, formData);
  }

  findByFormation(formationId: number): Observable<IPieceJointe[]> {
    return this.http.get<IPieceJointe[]>(`${this.resourceUrl}/by-formation/${formationId}`);
  }

  // ───────── Pièces jointes d'un formateur ─────────
  uploadForFormateur(file: File, formateurId: number): Observable<IPieceJointe> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('formateurId', String(formateurId));
    return this.http.post<IPieceJointe>(`${this.resourceUrl}/upload-formateur`, formData);
  }

  findByFormateur(formateurId: number): Observable<IPieceJointe[]> {
    return this.http.get<IPieceJointe[]>(`${this.resourceUrl}/by-formateur/${formateurId}`);
  }

  // ───────── Commun : aperçu / téléchargement / renommage ─────────
  getFile(id: number): Observable<Blob> {
    return this.http.get(`${this.resourceUrl}/getFile`, { params: { id }, responseType: 'blob' });
  }

  rename(id: number, nomFichier: string): Observable<IPieceJointe> {
    return this.http.patch<IPieceJointe>(`${this.resourceUrl}/${id}/rename`, { nomFichier });
  }

  addPieceJointeToCollectionIfMissing(
    pieceJointeCollection: IPieceJointe[],
    ...pieceJointesToCheck: (IPieceJointe | null | undefined)[]
  ): IPieceJointe[] {
    const pieceJointes: IPieceJointe[] = pieceJointesToCheck.filter(isPresent);
    if (pieceJointes.length > 0) {
      const pieceJointeCollectionIdentifiers = pieceJointeCollection.map(pieceJointeItem => getPieceJointeIdentifier(pieceJointeItem)!);
      const pieceJointesToAdd = pieceJointes.filter(pieceJointeItem => {
        const pieceJointeIdentifier = getPieceJointeIdentifier(pieceJointeItem);
        if (pieceJointeIdentifier == null || pieceJointeCollectionIdentifiers.includes(pieceJointeIdentifier)) {
          return false;
        }
        pieceJointeCollectionIdentifiers.push(pieceJointeIdentifier);
        return true;
      });
      return [...pieceJointesToAdd, ...pieceJointeCollection];
    }
    return pieceJointeCollection;
  }

  protected convertDateFromClient(pieceJointe: IPieceJointe): IPieceJointe {
    return Object.assign({}, pieceJointe, {
      dateUpload: pieceJointe.dateUpload?.isValid() ? pieceJointe.dateUpload.toJSON() : undefined,
    });
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dateUpload = res.body.dateUpload ? dayjs(res.body.dateUpload) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((pieceJointe: IPieceJointe) => {
        pieceJointe.dateUpload = pieceJointe.dateUpload ? dayjs(pieceJointe.dateUpload) : undefined;
      });
    }
    return res;
  }
}
