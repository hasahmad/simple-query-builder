import {
  From,
  Field,
  Where,
  Join,
  Having,
  GroupBy,
  OrderBy,
  Limit,
} from '../statements';
import Query from './BaseQuery';

export default class Select extends Query {
  protected _limit?: Limit;
  protected _explain?: boolean;
  protected _distinct?: boolean;

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
    distinct: boolean = false
  ) {
    super('SELECT', tables, fields, wheres, joins, groups, orders, havings);
    this._limit = limit;
    this._explain = explain;
    this._distinct = distinct;
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

  distinct() {
    this._distinct = true;
    return this;
  }

  build() {
    const result = [
      "SELECT",
      this._fields.map(v => {
        const b = v.build();
        this._params.push(...b.params);
        return b.query;
      }).join(', '),
      "FROM",
      this._tables.map(v => {
        const b = v.build();
        this._params.push(...b.params);
        return b.query;
      }).join(', '),
    ];

    if (this._distinct) {
      result.unshift("DISTINCT");
    }

    if (this._explain) {
      result.unshift("EXPLAIN");
    }

    if (this._joins.length > 0) {
      result.push(
        this._joins.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }
    if (this._wheres.length > 0) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => {
          const b = v.build(i !== 0);
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }
    if (this._groups.length > 0) {
      result.push("GROUP BY");
      result.push(
        this._groups.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }
    if (this._havings.length > 0) {
      result.push("HAVING");
      result.push(
        this._havings.map((v, i) => {
          const b = v.build(i !== 0);
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }
    if (this._orders.length > 0) {
      result.push("ORDER BY");
      result.push(
        this._orders.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }
    if (this._limit) {
      result.push("LIMIT");
      const b = this._limit.build();
      result.push(b.query);
      this._params.push(...b.params);
    }

    return {
      query: result.join(' '),
      params: this._params,
    };
  }
}
