import * as dayjs from 'dayjs';

export interface IPieceJointe {
  id?: number;
  nomFichier?: string | null;
  type?: string | null;
  fichierURL?: string | null;
  dateUpload?: dayjs.Dayjs | null;
  formateurId?: number | null;
  sessionId?: number | null;
  formationId?: number | null;
}

export class PieceJointe implements IPieceJointe {
  constructor(
    public id?: number,
    public nomFichier?: string | null,
    public type?: string | null,
    public fichierURL?: string | null,
    public dateUpload?: dayjs.Dayjs | null,
    public formateurId?: number | null,
    public sessionId?: number | null,
    public formationId?: number | null
  ) {}
}

export function getPieceJointeIdentifier(pieceJointe: IPieceJointe): number | undefined {
  return pieceJointe.id;
}
