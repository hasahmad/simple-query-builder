import { IQueryBuilderParams } from "../types";

type Value = string | number | Date | Array<any> | null;

export default class Expression implements IQueryBuilderParams {
  private query: string;
  private params: Array<any>;

  constructor(query: string, params: Value | Array<Value>) {
    this.query = query;
    this.params = this.parseValue(params);
  }

  public build() {
    return {
      query: this.query,
      params: this.params,
    };
  }

  public parseValue(value: Value | Array<Value>) {
    if (typeof value === 'string'
      || typeof value === 'number'
      || value instanceof Date
      || value === null
    ) {
      return [value];
    }

    return value;
  }
}
