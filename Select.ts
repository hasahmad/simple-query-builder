import {
  From,
  Field,
  Where,
  Join,
  Having,
  GroupBy,
  OrderBy,
  Limit,
} from './builder';
import Query from './Query';

export default class Select extends Query {
  protected _limit?: Limit;
  protected _explain?: boolean;

  constructor(
    tables: Array<From> | string = [],
    fields: Array<Field> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    groups: Array<GroupBy> = [],
    orders: Array<OrderBy> = [],
    havings: Array<Having> = [],
    limit?: Limit,
    explain: boolean = false,
  ) {
    super('SELECT', tables, fields, wheres, joins, groups, orders, havings);
    this._limit = limit;
    this._explain = explain;
  }

  limit(limit: Limit | number, offset: number = 0) {
    if (limit instanceof Limit) {
      this._limit = limit;
      return this;
    }

    this._limit = new Limit(limit, offset);
    return this;
  }

  explain() {
    this._explain = true;
    return this;
  }

  build() {
    const result = [
      "SELECT",
      this._fields.map(f => f.build()).join(', '),
      "FROM",
      this._tables.map(v => v.build()).join(', '),
    ];

    if (this._explain) {
      result.unshift("EXPLAIN");
    }

    if (this._joins.length > 0) {
      result.push(
        this._joins.map(v => v.build()).join(' ')
      );
    }
    if (this._wheres.length > 0) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => v.build(i !== 0)).join(' ')
      );
    }
    if (this._groups.length > 0) {
      result.push("GROUP BY");
      result.push(
        this._groups.map(v => v.build()).join(' ')
      );
    }
    if (this._havings.length > 0) {
      result.push("HAVING");
      result.push(
        this._havings.map((v, i) => v.build(i !== 0)).join(' ')
      );
    }
    if (this._orders.length > 0) {
      result.push("ORDER BY");
      result.push(
        this._orders.map(v => v.build()).join(' ')
      );
    }
    if (this._limit) {
      result.push("LIMIT");
      result.push(
        this._limit.build()
      );
    }

    return result.join(' ');
  }

  toString() {
    return this.build();
  }
}
