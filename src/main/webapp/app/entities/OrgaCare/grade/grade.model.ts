export interface IGrade {
  id?: number;
  code?: string | null;
  label?: string | null;
}

export class Grade implements IGrade {
  constructor(public id?: number, public code?: string | null, public label?: string | null) {}
}

export function getGradeIdentifier(grade: IGrade): number | undefined {
  return grade.id;
}
