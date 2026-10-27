import * as dayjs from 'dayjs';

export interface ISalaire {
  id?: number;
  valeur?: number;
  date?: dayjs.Dayjs | null;
  personneId?: number | null;
}

export class Salaire implements ISalaire {
  constructor(public id?: number, public valeur?: number, public date?: dayjs.Dayjs | null, public personneId?: number | null) {}
}

export function getSalaireIdentifier(salaire: ISalaire): number | undefined {
  return salaire.id;
}
