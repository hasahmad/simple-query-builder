import {
  IQueryBuilder,
  Field,
  Fields,
  IWHERE,
  OP,
  TableName,
  Val,
  Wheres,
} from './types';
import { STAR } from './constants';
import InvalidTableNameError from './InvalidTableNameError';
import InvalidLimitError from './InvalidLimitError';
import InvalidValidError from './InvalidValidError';

export default class Select implements IQueryBuilder {
  private _tables: Array<TableName>;
  private _fields: Fields;
  private _wheres: Wheres;
  private _groups: Array<string>;
  private _orders: Array<string>;
  private _havings: Wheres;
  private _limit?: number;
  private _offset: number = 0;

  constructor(
    tables: Array<TableName> = [],
    fields: Fields = STAR,
    wheres: Wheres = [],
    groups: Array<string> = [],
    havings: Wheres = [],
    orders: Array<string> = [],
    limit?: number,
    offset: number = 0,
  ) {
    this._tables = tables;
    this._fields = fields;
    this._wheres = wheres;
    this._groups = groups;
    this._havings = havings;
    this._orders = orders;
    this._limit = limit;
    this._offset = offset;
  }

  select(fields: Fields = STAR) {
    this._fields = fields;
    return this;
  }

  field(field: Field) {
    if (this._fields === STAR) {
      this._fields = [];
    }

    this._fields.push(field);
    return this;
  }

  from(tables: TableName | Array<TableName>) {
    if (typeof tables === 'object' && Array.isArray(tables)) {
      this._tables = this._tables.concat(tables);
    } else {
      this._tables.push(tables);
    }
    return this;
  }

  where(where: string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    this._wheres.push({where, val, op, type: 'AND', raw});
    return this;
  }

  orWhere(where: string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    this._wheres.push({where, val, op, type: 'OR', raw});
    return this;
  }

  having(where: string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    this._havings.push({where, val, op, type: 'AND', raw});
    return this;
  }

  group(groups: string | Array<string>) {
    if (typeof groups === 'string') { this._groups.push(groups); }
    this._groups = this._groups.concat(groups);
    return this;
  }

  order(orders: string | Array<string>) {
    if (typeof orders === 'string') { this._orders.push(orders); }
    this._orders = this._orders.concat(orders);
    return this;
  }

  limit(limit: number, offset: number = 0) {
    this._limit = limit;
    this._offset = offset;
    return this;
  }

  build() {
    const result = [
      "SELECT",
      this.parseFields(),
      "FROM",
      this.parseTables(),
    ];

    if (this._wheres.length > 0) {
      result.push("WHERE");
      result.push(this.parseWheres());
    }
    if (this._groups.length > 0) {
      result.push("GROUP BY");
      result.push(this.parseGroupBys());
    }
    if (this._havings.length > 0) {
      result.push("HAVING");
      result.push(this.parseHavings());
    }
    if (this._orders.length > 0) {
      result.push("ORDER BY");
      result.push(this.parseOrderBys());
    }
    if (this._limit && this._limit > 0) {
      result.push("LIMIT");
      result.push(this.parseLimit());
    }

    return result.join(' ');
  }

  toString() {
    return this.build();
  }

  private parseFields() {
    if (this._fields === STAR) { return STAR; }

    return this._fields.map(f => {
      if (typeof f === 'string') { return f; }

      // { user_id: 'u.id' } => 'u.id as user_id'
      const k = Object.keys(f)[0];
      const val = f[k];
      return `${
        typeof val === 'string'
          ? val
          : val
      } AS ${k}`;
    }).join(', ');
  }

  private parseTables() {
    if (!this._tables || !this._tables.length) {
      throw new InvalidTableNameError();
    }

    return this._tables.map(t => {
      if (typeof t === 'string') { return t; }

      // { u: 'users' } => 'users as u'
      const k = Object.keys(t)[0];
      const val = t[k];
      return `${
        typeof val === 'string'
          ? val
          : "(" + val.build() + ")"
      } AS ${k}`;
    }).join(', ');
  }

  private parseWheres() {
    return this._wheres.map((w, i) => {
      return this.parseWhere(w, i !== 0);
    }).join(' ');
  }

  private parseWhere(w: IWHERE, prepend = true) {
    let result = "";
    if (typeof w.where === 'string') {
      if (w.val === undefined) {
        throw new InvalidValidError();
      }

      result = `(${w.where} ${w.op} ${this.parseValue(w.val, w.op, w.raw)})`;
    } else {
      result = `(${w.where.build()})`;
    }
    return !prepend ? result : `${w.type} ${result}`;
  }

  private parseValue(val: Val, op?: string, raw: boolean = false) {
    return typeof val === 'number' || raw
    ? `${val}`
    : val === null || (typeof val === 'string' && val.toLowerCase() === 'null')
    ? `NULL`
    : (typeof val === 'object' && Array.isArray(val)) || op === 'IN'
    ? `(${Array.isArray(val) ? "'" + val.join("','") + "'" : val})`
    : typeof val === 'object' && val.build
    ? `${val.build()}`
    : `'${val}'`;
  }

  private parseGroupBys() {
    return this._groups.join(', ');
  }

  private parseHavings() {
    return this._havings.map((w, i) => {
      return this.parseWhere(w, i !== 0);
    }).join(' ');
  }

  private parseOrderBys() {
    return this._orders.join(',');
  }

  private parseLimit() {
    if (typeof this._limit !== 'number') {
      throw new InvalidLimitError();
    }

    if (typeof this._offset === 'undefined' || isNaN(this._offset)) {
      return `${this._limit}`;
    }

    return `${this._offset} ${this._limit}`;
  }
}