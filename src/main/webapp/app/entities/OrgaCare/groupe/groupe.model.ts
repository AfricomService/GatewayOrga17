import * as dayjs from 'dayjs';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface IGroupe {
  id?: number;
  code?: string | null;
  nom?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  dateActivation?: dayjs.Dayjs | null;
  etat?: Etat;
  organigramme?: IOrganigramme | null;
}

export class Groupe implements IGroupe {
  constructor(
    public id?: number,
    public code?: string | null,
    public nom?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public dateActivation?: dayjs.Dayjs | null,
    public etat?: Etat,
    public organigramme?: IOrganigramme | null
  ) {}
}

export function getGroupeIdentifier(groupe: IGroupe): number | undefined {
  return groupe.id;
}
