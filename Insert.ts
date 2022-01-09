import { Field, From, Join, Where } from "./builder";
import Query from "./BaseQuery";
import { IQueryBuilder, TableName } from "./types";

export type IData = Array<Array<any> | any> | IQueryBuilder;

export default class Insert extends Query {
  protected _data: IData;

  constructor(
    table?: From | TableName,
    data: IData = [],
    fields: Array<Field> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    returning: Array<Field> = [],
  ) {
    super('INSERT', [], fields, wheres, joins, [], [], [], returning);
    if (table) {
      if (table instanceof From) {
        this._tables = [table];
      } else {
        this._tables = [new From(table)];
      }
    }

    this._data = data;
  }

  build(): string {
    let data = "";
    if (Array.isArray(this._data)) {
      data = "(" + this._data.map(d => {
        if (Array.isArray(d)) {
          return d.map(v => Where.parseValue(v));
        }
        return Where.parseValue(d);
      }).join('), (') + ")";
    } else {
      data = `(${this._data.build()})`;
    }

    const result = [
      "INSERT INTO",
      this._tables[0].build(),
      this._fields.length > 0 ? `(${this._fields.map(v => v.build()).join(', ')})` : '',
      "VALUES",
      data,
    ].filter(v => v.trim());

    if (this._joins.length) {
      result.push(
        this._joins.map(v => v.build()).join(' ')
      );
    }

    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => v.build(i !== 0)).join(' ')
      );
    }

    if (this._returning.length) {
      result.push("RETURNING");
      result.push(
        this._returning.map(v => v.build()).join(', ')
      );
    }

    return result.join(' ');
  }

  into(table: From | TableName) {
    return this.table(table);
  }

  data(data: Array<{[key: string]: any} | Array<any>> | IQueryBuilder) {
    if (!Array.isArray(data)) {
      this._data = data;
      return this;
    }

    if (typeof data[0] === 'object' &&
      !Array.isArray(data[0]) &&
      !this._fields.length
    ) {
      this._fields = Object.keys(data[0]).map(v => new Field(v));
    }

    this._data = data.map(d => {
      if (typeof d === 'object' && !Array.isArray(d)) {
        return this._fields.map(f => d[f.build()]);
      }

      return d;
    });
    return this;
  }

  fields(fields: Array<string>) {
    this._fields = fields.map(v => new Field(v));
    return this;
  }
}
