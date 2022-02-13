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
    return Field.parseField(this.field);
  }

  static parseField(f: Col) {
    if (typeof f === 'string') {
      return {
        query: f,
        params: [],
      };
    }

      // { user_id: 'u.id' } => 'u.id as user_id'
      const k = Object.keys(f)[0];
      const val = f[k];
      let params = [];
      if (typeof val != 'string') {
        params = val.build().params;
      }

      return {
        query: `${
          typeof val === 'string'
            ? val
            : "(" + val.build().query + ")"
        } AS ${k}`,
        params: params,
      };
  }
}
