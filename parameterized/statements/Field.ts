import { ISTAR } from "../../constants";
import { IQueryBuilderParams } from "../types";

export type Col = {[alias: string]: string | IQueryBuilderParams} | string;
export type Fields = Array<Field> | ISTAR;

export default class Field implements IQueryBuilderParams {
  private field: Col;

  constructor(field: Col) {
    this.field = field;
  }

  public build() {
    return {
      query: Field.parseField(this.field),
      params: [],
    };
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
