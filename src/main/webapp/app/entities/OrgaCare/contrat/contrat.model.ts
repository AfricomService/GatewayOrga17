import * as dayjs from 'dayjs';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { ITypeContrat } from 'app/entities/OrgaCare/type-contrat/type-contrat.model';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';

export interface IContrat {
  id?: number;
  dateDebut?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  type?: string | null;
  status?: string | null;
  societe?: ISociete | null;
  typeContrat?: ITypeContrat | null;
  personne?: IPersonne | null;
}

export class Contrat implements IContrat {
  constructor(
    public id?: number,
    public dateDebut?: dayjs.Dayjs | null,
    public dateFin?: dayjs.Dayjs | null,
    public type?: string | null,
    public status?: string | null,
    public societe?: ISociete | null,
    public typeContrat?: ITypeContrat | null,
    public personne?: IPersonne | null
  ) {}
}

export function getContratIdentifier(contrat: IContrat): number | undefined {
  return contrat.id;
}
