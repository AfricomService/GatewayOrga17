import * as dayjs from 'dayjs';

export interface ISessionFormation {
  id?: number;
  title?: string | null;
  datePlanificationDu?: dayjs.Dayjs | null;
  datePlanificationAu?: dayjs.Dayjs | null;
  dateExecutionDu?: dayjs.Dayjs | null;
  dateExecutionAu?: dayjs.Dayjs | null;
  reglementaire?: boolean | null;
  typeFormation?: string | null;
  budget?: string | null;
  coutSession?: number | null;
  statut?: string | null;
  additionalInformations?: string | null;
  dateCreation?: dayjs.Dayjs | null;
  themeId?: number | null;
  formateurId?: number | null;
  societeId?: number | null;
  description?: string | null;
}

export class SessionFormation implements ISessionFormation {
  constructor(
    public id?: number,
    public title?: string | null,
    public datePlanificationDu?: dayjs.Dayjs | null,
    public datePlanificationAu?: dayjs.Dayjs | null,
    public dateExecutionDu?: dayjs.Dayjs | null,
    public dateExecutionAu?: dayjs.Dayjs | null,
    public reglementaire?: boolean | null,
    public typeFormation?: string | null,
    public budget?: string | null,
    public coutSession?: number | null,
    public statut?: string | null,
    public additionalInformations?: string | null,
    public dateCreation?: dayjs.Dayjs | null,
    public themeId?: number | null,
    public formateurId?: number | null,
    public societeId?: number | null,
    public description?: string | null
  ) {
    this.reglementaire = this.reglementaire ?? false;
  }
}

export function getSessionFormationIdentifier(sessionFormation: ISessionFormation): number | undefined {
  return sessionFormation.id;
}
