export class UnitEntity {
  code: string;
  label: string;

  constructor(partial?: Partial<UnitEntity>) {
    Object.assign(this, partial);
  }
}
