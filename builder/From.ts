import InvalidTableNameError from "../exceptions/InvalidTableNameError";
import { IQueryBuilder } from "../interfaces/IQueryBuilder";

export type TableName = {[alias: string]: string | IQueryBuilder} | string;

export default class From implements IQueryBuilder {
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
    if (typeof t === 'string') { return t; }

    // { u: 'users' } => 'users as u'
    const k = Object.keys(t)[0];
    const val = t[k];
    return `${
      typeof val === 'string'
        ? val
        : "(" + val.build() + ")"
    } AS ${k}`;
  }
}