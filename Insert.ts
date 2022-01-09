import { Field, From, Join, Where } from "./builder";
import Query from "./Query";
import { TableName } from "./types";

export type IData = Array<Array<any> | any>;

export default class Insert extends Query {
  protected _data: IData;

  constructor(
    table?: From | TableName,
    data: IData = [],
    fields: Array<Field> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
  ) {
    super('INSERT', [], fields, wheres, joins);
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
    const result = [
      "INSERT INTO",
      this._tables[0].build(),
      this._fields.length > 0 ? `(${this._fields.map(v => v.build()).join(', ')})` : '',
      "VALUES",
      "(" + this._data.map(d => {
        if (Array.isArray(d)) {
          return d.map(v => Where.parseValue(v));
        }
        return Where.parseValue(d);
      }).join('), (') + ")"
    ].filter(v => v.trim());
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

  into(table: From | TableName) {
    return this.table(table);
  }

  data(data: Array<{[key: string]: any} | Array<any>>) {
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
