import * as dayjs from 'dayjs';
import { IContrat } from 'app/entities/OrgaCare/contrat/contrat.model';
import { IAffectation } from 'app/entities/OrgaCare/affectation/affectation.model';
import { IGrade } from 'app/entities/OrgaCare/grade/grade.model';
import { IFonction } from 'app/entities/OrgaCare/fonction/fonction.model';
import { IDepartement } from 'app/entities/OrgaCare/departement/departement.model';
import { Etat } from 'app/entities/enumerations/etat.model';
import { EtatContractuelle } from 'app/entities/enumerations/etat-contractuelle.model';

export interface IPersonne {
  id?: number;
  matricule?: string | null;
  nomPrenom?: string | null;
  email?: string | null;
  numTelephone?: string | null;
  genre?: string | null;
  cin?: string | null;
  etat?: Etat;
  etatContractuelle?: EtatContractuelle;
  dateCreation?: dayjs.Dayjs | null;
  dateDebutContrat?: dayjs.Dayjs | null;
  idContratActif?: number | null;
  idTypeContratActif?: number | null;
  userId?: string | null;
  contrats?: IContrat[] | null;
  affectation?: IAffectation | null;
  grade?: IGrade | null;
  fonction?: IFonction | null;
  departements?: IDepartement[] | null;
}

export class Personne implements IPersonne {
  constructor(
    public id?: number,
    public matricule?: string | null,
    public nomPrenom?: string | null,
    public email?: string | null,
    public numTelephone?: string | null,
    public genre?: string | null,
    public cin?: string | null,
    public etat?: Etat,
    public etatContractuelle?: EtatContractuelle,
    public dateCreation?: dayjs.Dayjs | null,
    public dateDebutContrat?: dayjs.Dayjs | null,
    public idContratActif?: number | null,
    public idTypeContratActif?: number | null,
    public userId?: string | null,
    public contrats?: IContrat[] | null,
    public affectation?: IAffectation | null,
    public grade?: IGrade | null,
    public fonction?: IFonction | null,
    public departements?: IDepartement[] | null
  ) {}
}

export function getPersonneIdentifier(personne: IPersonne): number | undefined {
  return personne.id;
}
