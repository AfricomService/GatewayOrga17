import * as dayjs from 'dayjs';
import { IOrganigramme } from 'app/entities/OrgaCare/organigramme/organigramme.model';
import { ISite } from 'app/entities/OrgaCare/site/site.model';
import { IContrat } from 'app/entities/OrgaCare/contrat/contrat.model';
import { IFormeJuridique } from 'app/entities/OrgaCare/forme-juridique/forme-juridique.model';
import { Etat } from 'app/entities/enumerations/etat.model';

export interface ISociete {
  id?: number;
  raisonSociale?: string;
  abreviation?: string | null;
  activite?: string | null;
  formeJuridique?: string | null;
  adresse?: string | null;
  codePostale?: string | null;
  ville?: string | null;
  pays?: string | null;
  region?: string | null;
  tel?: string | null;
  fax?: string | null;
  mail?: string | null;
  siteInternet?: string | null;
  matriculeFiscale?: string | null;
  logoContentType?: string | null;
  logo?: string | null;
  imagesSitePrincipaleContentType?: string | null;
  imagesSitePrincipale?: string | null;
  holding?: string | null;
  etat?: Etat;
  dateCreation?: dayjs.Dayjs | null;
  dateActivation?: dayjs.Dayjs | null;
  dateCloture?: dayjs.Dayjs | null;
  importTemplateContentType?: string | null;
  importTemplate?: string | null;
  codeSociete?: string | null;
  codeOrganigramme?: string;
  organigrammes?: IOrganigramme[] | null;
  sites?: ISite[] | null;
  contrats?: IContrat[] | null;
  formeJuridiquee?: IFormeJuridique | null;
}

export class Societe implements ISociete {
  constructor(
    public id?: number,
    public raisonSociale?: string,
    public abreviation?: string | null,
    public activite?: string | null,
    public formeJuridique?: string | null,
    public adresse?: string | null,
    public codePostale?: string | null,
    public ville?: string | null,
    public pays?: string | null,
    public region?: string | null,
    public tel?: string | null,
    public fax?: string | null,
    public mail?: string | null,
    public siteInternet?: string | null,
    public matriculeFiscale?: string | null,
    public logoContentType?: string | null,
    public logo?: string | null,
    public imagesSitePrincipaleContentType?: string | null,
    public imagesSitePrincipale?: string | null,
    public holding?: string | null,
    public etat?: Etat,
    public dateCreation?: dayjs.Dayjs | null,
    public dateActivation?: dayjs.Dayjs | null,
    public dateCloture?: dayjs.Dayjs | null,
    public importTemplateContentType?: string | null,
    public importTemplate?: string | null,
    public codeSociete?: string | null,
    public codeOrganigramme?: string,
    public organigrammes?: IOrganigramme[] | null,
    public sites?: ISite[] | null,
    public contrats?: IContrat[] | null,
    public formeJuridiquee?: IFormeJuridique | null
  ) {}
}

export function getSocieteIdentifier(societe: ISociete): number | undefined {
  return societe.id;
}
