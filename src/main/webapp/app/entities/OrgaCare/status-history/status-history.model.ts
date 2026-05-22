import * as dayjs from 'dayjs';

export interface IStatusHistory {
  id?: number;
  dateTransaction?: dayjs.Dayjs | null;
  dateFin?: dayjs.Dayjs | null;
  loginUser?: string | null;
  transaction?: string | null;
  transactionReference?: string | null;
  dataObject?: string | null;
}

export class StatusHistory implements IStatusHistory {
  constructor(
    public id?: number,
    public dateTransaction?: dayjs.Dayjs | null,
    public dateFin?: dayjs.Dayjs | null,
    public loginUser?: string | null,
    public transaction?: string | null,
    public transactionReference?: string | null,
    public dataObject?: string | null
  ) {}
}

export function getStatusHistoryIdentifier(statusHistory: IStatusHistory): number | undefined {
  return statusHistory.id;
}
