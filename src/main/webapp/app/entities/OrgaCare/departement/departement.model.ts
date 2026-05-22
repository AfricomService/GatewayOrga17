import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { ISite } from 'app/entities/OrgaCare/site/site.model';
import { IPersonne } from 'app/entities/OrgaCare/personne/personne.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface IDepartement {
  id?: number;
  code?: string | null;
  nom?: string | null;
  status?: Etat;
  email?: string | null;
  organigramme?: IOrganigramme | null;
  site?: ISite | null;
  departementParent?: IDepartement | null;
  personnes?: IPersonne[] | null;
}

export class Departement implements IDepartement {
  constructor(
    public id?: number,
    public code?: string | null,
    public nom?: string | null,
    public status?: Etat,
    public email?: string | null,
    public organigramme?: IOrganigramme | null,
    public site?: ISite | null,
    public departementParent?: IDepartement | null,
    public personnes?: IPersonne[] | null
  ) {}
}

export function getDepartementIdentifier(departement: IDepartement): number | undefined {
  return departement.id;
}
