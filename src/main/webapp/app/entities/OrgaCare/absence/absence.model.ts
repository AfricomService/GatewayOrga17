import * as dayjs from 'dayjs';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface IAbsence {
  id?: number;
  dateCreation?: dayjs.Dayjs | null;
  etat?: Etat;
  dateDebut?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  motif?: string | null;
  personneAbscent?: IPersonne | null;
  personneRemplacant?: IPersonne | null;
}

export class Absence implements IAbsence {
  constructor(
    public id?: number,
    public dateCreation?: dayjs.Dayjs | null,
    public etat?: Etat,
    public dateDebut?: dayjs.Dayjs | null,
    public dateFin?: dayjs.Dayjs | null,
    public motif?: string | null,
    public personneAbscent?: IPersonne | null,
    public personneRemplacant?: IPersonne | null
  ) {}
}

export function getAbsenceIdentifier(absence: IAbsence): number | undefined {
  return absence.id;
}
