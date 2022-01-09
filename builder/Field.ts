import { Field as Col, IQueryBuilder, TableName } from "../types";

export default class Field implements IQueryBuilder {
  private field: Col;

  constructor(field: Col) {
    this.field = field;
  }

  public build() {
    return Field.parseField(this.field);
  }

  static parseField(f: Col) {
    if (typeof f === 'string') { return f; }

      // { user_id: 'u.id' } => 'u.id as user_id'
      const k = Object.keys(f)[0];
      const val = f[k];
      return `${
        typeof val === 'string'
          ? val
          : val
      } AS ${k}`;
  }
}
