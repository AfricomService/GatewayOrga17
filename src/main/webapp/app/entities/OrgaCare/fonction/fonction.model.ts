export interface IFonction {
  id?: number;
  code?: string | null;
  label?: string | null;
}

export class Fonction implements IFonction {
  constructor(public id?: number, public code?: string | null, public label?: string | null) {}
}

export function getFonctionIdentifier(fonction: IFonction): number | undefined {
  return fonction.id;
}
