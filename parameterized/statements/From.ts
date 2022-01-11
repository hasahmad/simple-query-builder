import { IQueryBuilderParams } from "../types";

export type TableName = {[alias: string]: string | IQueryBuilderParams} | string;

export default class From implements IQueryBuilderParams {
  protected static predicate: string = "FROM";
  private table: TableName;

  constructor(table: TableName) {
    this.table = table;
  }

  public build() {
    return this.parseTable();
  }

  private parseTable() {
    return From.parseTableName(this.table);
  }

  static parseTableName(t: TableName) {
    if (typeof t === 'string') {
      return {
        query: t,
        params: [],
      };
    }

    // { u: 'users' } => 'users as u'
    const k = Object.keys(t)[0];
    const val = t[k];
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