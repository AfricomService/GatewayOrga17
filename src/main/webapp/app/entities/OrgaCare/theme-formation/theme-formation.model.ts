export interface IThemeFormation {
  id?: number;
  theme?: string;
  cout?: number | null;
  duree_validite_certificat?: number | null;
  notifier_expiration_avant?: number | null;
  duree_anticipation_utilisateur?: number | null;
  cout_formation_individuelle?: number | null;
  status?: string | null;
  comments?: string | null;
}

export class ThemeFormation implements IThemeFormation {
  constructor(
    public id?: number,
    public theme?: string,
    public cout?: number | null,
    public duree_validite_certificat?: number | null,
    public notifier_expiration_avant?: number | null,
    public duree_anticipation_utilisateur?: number | null,
    public cout_formation_individuelle?: number | null,
    public status?: string | null,
    public comments?: string | null
  ) {}
}

export function getThemeFormationIdentifier(themeFormation: IThemeFormation): number | undefined {
  return themeFormation.id;
}
