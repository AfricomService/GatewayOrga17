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
  organigrammeId?: number | null; // ← ajouter
  site?: ISite | null;
  siteId?: number | null; // ← ajouter
  departementParent?: IDepartement | null;
  departementParentId?: number | null; // ← ajouter (cohérence)
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
    public organigrammeId?: number | null, // ← ajouter
    public site?: ISite | null,
    public siteId?: number | null, // ← ajouter
    public departementParent?: IDepartement | null,
    public departementParentId?: number | null, // ← ajouter
    public personnes?: IPersonne[] | null
  ) {}
}

export function getDepartementIdentifier(departement: IDepartement): number | undefined {
  return departement.id;
}
