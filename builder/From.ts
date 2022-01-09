import InvalidTableNameError from "../exceptions/InvalidTableNameError";
import { IQueryBuilder, TableName } from "../types";

export default class From implements IQueryBuilder {
  protected static predicate: string = "FROM";
  private _tables: Array<TableName>;

  constructor(tables: TableName | Array<TableName>) {
    this._tables = [];
    this.addTables(tables);
  }

  getTables() {
    return this._tables;
  }

  addTables(tables: TableName | Array<TableName>) {
    if (typeof tables === 'object' && Array.isArray(tables)) {
      this._tables = this._tables.concat(tables);
    } else {
      this._tables.push(tables);
    }
  }

  public build() {
    return this.parseTables();
  }

  private parseTables() {
    if (!this._tables || !this._tables.length) {
      throw new InvalidTableNameError();
    }

    return this._tables.map(From.parseTableName).join(', ');
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