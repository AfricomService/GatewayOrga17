export interface IFormateur {
  id?: number;
  nomPrenom?: string;
  cin?: string | null;
  email?: string | null;
  telephone?: string | null;
  status?: string | null;
  comments?: string | null;
  themeId?: number | null;
}

export class Formateur implements IFormateur {
  constructor(
    public id?: number,
    public nomPrenom?: string,
    public cin?: string | null,
    public email?: string | null,
    public telephone?: string | null,
    public status?: string | null,
    public comments?: string | null,
    public themeId?: number | null
  ) {}
}

export function getFormateurIdentifier(formateur: IFormateur): number | undefined {
  return formateur.id;
}
