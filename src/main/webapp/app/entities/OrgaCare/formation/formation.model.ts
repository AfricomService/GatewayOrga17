import * as dayjs from 'dayjs';

export interface IFormation {
  id?: number;
  statut?: string | null;
  etat?: string | null;
  note?: number | null;
  dateObtentionCertificat?: dayjs.Dayjs | null;
  dateExpirationCertificat?: dayjs.Dayjs | null;
  notificationEnvoyee?: boolean | null;
  commentaire?: string | null;
  sessionId?: number | null;
  personneId?: number | null;
}

export class Formation implements IFormation {
  constructor(
    public id?: number,
    public statut?: string | null,
    public etat?: string | null,
    public note?: number | null,
    public dateObtentionCertificat?: dayjs.Dayjs | null,
    public dateExpirationCertificat?: dayjs.Dayjs | null,
    public notificationEnvoyee?: boolean | null,
    public commentaire?: string | null,
    public sessionId?: number | null,
    public personneId?: number | null
  ) {
    this.notificationEnvoyee = this.notificationEnvoyee ?? false;
  }
}

export function getFormationIdentifier(formation: IFormation): number | undefined {
  return formation.id;
}
