import * as dayjs from 'dayjs';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';

export interface IFormeJuridique {
  id?: number;
  abreviation?: string | null;
  nom?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  etat?: string | null;
  societes?: ISociete[] | null;
}

export class FormeJuridique implements IFormeJuridique {
  constructor(
    public id?: number,
    public abreviation?: string | null,
    public nom?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public etat?: string | null,
    public societes?: ISociete[] | null
  ) {}
}

export function getFormeJuridiqueIdentifier(formeJuridique: IFormeJuridique): number | undefined {
  return formeJuridique.id;
}
