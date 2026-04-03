export class UnitEntity {
  code: string;

  constructor(partial?: Partial<UnitEntity>) {
    Object.assign(this, partial);
  }
}
