import InvalidTableNameError from "../exceptions/InvalidTableNameError";
import { IQueryBuilder } from "../interfaces/IQueryBuilder";

export type TableName = {[alias: string]: string | IQueryBuilder} | string;

export default class From implements IQueryBuilder {
  protected static predicate: string = "FROM";
  private tables: Array<TableName>;

  constructor(tables: TableName | Array<TableName>) {
    this.tables = [];
    this.addTables(tables);
  }

  getTables() {
    return this.tables;
  }

  addTables(tables: TableName | Array<TableName>) {
    if (typeof tables === 'object' && Array.isArray(tables)) {
      this.tables = this.tables.concat(tables);
    } else {
      this.tables.push(tables);
    }
  }

  public build() {
    return this.parseTables();
  }

  private parseTables() {
    if (!this.tables || !this.tables.length) {
      throw new InvalidTableNameError();
    }

    return this.tables.map(From.parseTableName).join(', ');
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