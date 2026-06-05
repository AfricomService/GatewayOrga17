import * as dayjs from 'dayjs';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface IOrganigramme {
  id?: number;
  code?: string | null;
  nom?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  dateAction?: dayjs.Dayjs | null;
  dateExpiration?: dayjs.Dayjs | null;
  etat?: Etat;
  societe?: ISociete | null;
  societeId?: number | null;
  societeRaisonSociale?: string | null;
}

export interface IOrganigrammeCode {
  id?: number;
  code?: string | null;
}

export class Organigramme implements IOrganigramme {
  constructor(
    public id?: number,
    public code?: string | null,
    public nom?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public dateAction?: dayjs.Dayjs | null,
    public dateExpiration?: dayjs.Dayjs | null,
    public etat?: Etat,
    public societe?: ISociete | null,
    public societeId?: number | null // ← ajouter
  ) {}
}

export function getOrganigrammeIdentifier(organigramme: IOrganigramme): number | undefined {
  return organigramme.id;
}
