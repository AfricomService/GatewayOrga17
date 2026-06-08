import * as dayjs from 'dayjs';
import { IDepartement } from 'app/entities/OrgaCare/departement/departement.model';
import { IGroupe } from 'app/entities/OrgaCare/groupe/groupe.model';
import { ISociete } from 'app/entities/OrgaCare/societe/societe.model';
import { TypeAffectation } from 'app/entities/enumerations/type-affectation.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface IAffectation {
  id?: number;
  type?: TypeAffectation;
  dateCreation?: dayjs.Dayjs | null;
  dateAction?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  etat?: Etat;
  departementId?: number;
  personneId?: number;
  groupeId?: number;
  societeId?: number;
  departement?: IDepartement | null;
  groupe?: IGroupe | null;
  societe?: ISociete | null;
}

export class Affectation implements IAffectation {
  constructor(
    public id?: number,
    public type?: TypeAffectation,
    public dateCreation?: dayjs.Dayjs | null,
    public dateAction?: dayjs.Dayjs | null,
    public dateFin?: dayjs.Dayjs | null,
    public etat?: Etat,
    public departement?: IDepartement | null,
    public groupe?: IGroupe | null,
    public societe?: ISociete | null
  ) {}
}

export function getAffectationIdentifier(affectation: IAffectation): number | undefined {
  return affectation.id;
}
