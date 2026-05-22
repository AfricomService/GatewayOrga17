import * as dayjs from 'dayjs';
import { IContrat } from 'app/entities/OrgaCare/contrat/contrat.model';

export interface ITypeContrat {
  id?: number;
  nom?: string | null;
  abreviation?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  status?: string | null;
  contrats?: IContrat[] | null;
}

export class TypeContrat implements ITypeContrat {
  constructor(
    public id?: number,
    public nom?: string | null,
    public abreviation?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public status?: string | null,
    public contrats?: IContrat[] | null
  ) {}
}

export function getTypeContratIdentifier(typeContrat: ITypeContrat): number | undefined {
  return typeContrat.id;
}
