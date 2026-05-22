export interface IEmployeCreatedEvent {
  id?: number;
  matricule?: string | null;
  nomPrenom?: string | null;
  email?: string | null;
  userId?: number | null;
}

export class EmployeCreatedEvent implements IEmployeCreatedEvent {
  constructor(
    public id?: number,
    public matricule?: string | null,
    public nomPrenom?: string | null,
    public email?: string | null,
    public userId?: number | null
  ) {}
}

export function getEmployeCreatedEventIdentifier(employeCreatedEvent: IEmployeCreatedEvent): number | undefined {
  return employeCreatedEvent.id;
}
