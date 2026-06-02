export interface IUser {
  id?: string;
  login?: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  activated?: boolean;
  langKey?: string | null;
  imageUrl?: string | null;
  authorities?: string[];
}

export class User implements IUser {
  constructor(
    public id: string,
    public login: string,
    public firstName?: string | null,
    public lastName?: string | null,
    public email?: string | null,
    public activated?: boolean,
    public langKey?: string | null,
    public imageUrl?: string | null,
    public authorities?: string[]
  ) {}
}

export function getUserIdentifier(user: IUser): string | undefined {
  return user.id;
}
