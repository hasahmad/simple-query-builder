import { From, Join, Where } from "./builder";
import Query from "./Query";
import { TableName } from "./types";

export default class Delete extends Query {
  protected _wheres: Array<Where>;
  protected _joins: Array<Join>;

  constructor(
    table?: From | TableName,
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
  ) {
    super('DELETE', [], [], wheres, joins);
    if (table) {
      if (table instanceof From) {
        this._tables = [table];
      } else {
        this._tables = [new From(table)];
      }
    }

    this._wheres = wheres;
    this._joins = joins;
  }

  build(): string {
    const result = [
      "DELETE",
      "FROM",
      this._tables[0].build(),
    ];
    if (this._joins.length) {
      result.push(
        this._joins.map(v => v.build()).join(' ')
      )
    }
    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => v.build(i !== 0)).join(' ')
      )
    }

    return result.join(' ');
  }

  from(table: From | TableName) {
    if (table instanceof From) {
      this._tables = [table];
      return this;
    }

    this.from(new From(table));
    return this;
  }
}
