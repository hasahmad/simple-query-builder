import { From, Join, Where } from "./builder";
import InvalidValueError from "./exceptions/InvalidValueError";
import { IQueryBuilder, JoinOn, JoinType, OP, TableName, Val } from "./types";

export type IData = Array<Array<any> | any>;

export default class Insert implements IQueryBuilder {
  private _table!: From;
  private _data: IData;
  private _fields: Array<string>;
  private _wheres: Array<Where>;
  private _joins: Array<Join>;

  constructor(
    table?: From | TableName,
    data: IData = [],
    fields: Array<string> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
  ) {
    if (table) {
      if (table instanceof From) {
        this._table = table;
      } else {
        this._table = new From(table);
      }
    }

    this._data = data;
    this._fields = fields;
    this._wheres = wheres;
    this._joins = joins;
  }

  build(): string {
    const result = [
      "INSERT INTO",
      this._table.build(),
      this._fields.length > 0 ? `(${this._fields.map(v => v).join(', ')})` : '',
      "VALUES",
      "(" + this._data.map(d => {
        if (Array.isArray(d)) {
          return d.map(v => Where.parseValue(v));
        } else {
          return Where.parseValue(d)
        }
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

  table(table: From | TableName) {
    if (table instanceof From) {
      this._table = table;
      return this;
    }

    this.table(new From(table));
    return this;
  }

  into(table: From | TableName) {
    return this.table(table);
  }

  data(data: Array<{[key: string]: any} | Array<any>>) {
    if (typeof data[0] === 'object' &&
      !Array.isArray(data[0]) &&
      !this._fields.length
    ) {
      this._fields = Object.keys(data[0]);
    }

    this._data = data.map(d => {
      if (typeof d === 'object' && !Array.isArray(d)) {
        return this._fields.map(f => d[f]);
      }

      return d;
    });
    return this;
  }

  fields(data: Array<string>) {
    this._fields = data;
    return this;
  }

  join(join: Join | TableName, on?: JoinOn, type: JoinType = 'INNER') {
    if (join instanceof Join) {
      this._joins.push(join);
      return this;
    }
    if (!on) {
      throw new InvalidValueError();
    }

    this._joins.push(new Join(join, on, type));
    return this;
  }

  joinInner(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'INNER');
  }

  joinOuter(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'OUTER');
  }

  joinLeft(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'LEFT');
  }

  joinRight(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'RIGHT');
  }

  where(where: Where | string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    if (where instanceof Where) {
      this._wheres.push(where);
      return this;
    }

    this._wheres.push(new Where(where, op, val, 'AND', raw));
    return this;
  }

  orWhere(where: Where | string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    if (where instanceof Where) {
      this._wheres.push(where);
      return this;
    }

    this._wheres.push(new Where(where, op, val, 'OR', raw));
    return this;
  }
}
