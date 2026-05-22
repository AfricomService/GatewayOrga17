import * as dayjs from 'dayjs';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface ISite {
  id?: number;
  code?: string | null;
  nom?: string | null;
  etat?: Etat;
  adresse?: string | null;
  codePostale?: string | null;
  ville?: string | null;
  tel?: string | null;
  fax?: string | null;
  email?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  dateActivation?: dayjs.Dayjs | null;
  dateCloture?: dayjs.Dayjs | null;
  societe?: ISociete | null;
}

export class Site implements ISite {
  constructor(
    public id?: number,
    public code?: string | null,
    public nom?: string | null,
    public etat?: Etat,
    public adresse?: string | null,
    public codePostale?: string | null,
    public ville?: string | null,
    public tel?: string | null,
    public fax?: string | null,
    public email?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public dateActivation?: dayjs.Dayjs | null,
    public dateCloture?: dayjs.Dayjs | null,
    public societe?: ISociete | null
  ) {}
}

export function getSiteIdentifier(site: ISite): number | undefined {
  return site.id;
}
