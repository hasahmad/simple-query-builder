import { Field, From, Join, Where } from "../statements";
import Query from "./BaseQuery";
import { TableName } from "../types";

export default class Delete extends Query {
  constructor(
    table?: From | TableName,
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    returning: Array<Field> = [],
  ) {
    super('DELETE', [], [], wheres, joins, [], [], [], returning);
    if (table) {
      if (table instanceof From) {
        this._tables = [table];
      } else {
        this._tables = [new From(table)];
      }
    }
  }

  build() {
    const result = [
      "DELETE",
      "FROM",
      this._tables[0].build().query,
    ];
    this._params.push(...this._tables[0].build().params);
    if (this._joins.length) {
      result.push(
        this._joins.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      )
    }
    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => {
          const b = v.build(i !== 0);
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      )
    }
    if (this._returning.length) {
      result.push("RETURNING");
      result.push(
        this._returning.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(', ')
      );
    }

    return {
      query: result.join(' '),
      params: this._params,
    };
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
