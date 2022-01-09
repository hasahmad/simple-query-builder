import {
  IQueryBuilder,
  OP,
  TableName,
  Val,
  JoinOn,
  JoinType,
  Col,
} from './types';
import { STAR } from './constants';
import InvalidTableNameError from './exceptions/InvalidTableNameError';
import InvalidValueError from './exceptions/InvalidValueError';
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

export default class Select implements IQueryBuilder {
  private _tables: Array<From>;
  private _fields: Array<Field>;
  private _wheres: Array<Where>;
  private _joins: Array<Join>;
  private _groups: Array<GroupBy>;
  private _orders: Array<OrderBy>;
  private _havings: Array<Having>;
  private _limit?: Limit;
  private _explain?: boolean;

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
    if (typeof tables === 'string') {
      this._tables = [new From(tables)];
    } else {
      this._tables = tables;
    }
    this._fields = fields;
    this._wheres = wheres;
    this._joins = joins;
    this._groups = groups;
    this._orders = orders;
    this._havings = havings;
    this._limit = limit;
    this._explain = explain;
  }

  select(fields: Array<Field | Col> = [STAR]) {
    for (const f of fields) {
      this.field(f);
    }
    return this;
  }

  field(field: Field | Col) {
    if (field instanceof Field) {
      this._fields.push(field);
    } else {
      this._fields.push(new Field(field));
    }
    return this;
  }

  from(tables: From | TableName | Array<TableName>) {
    if (tables instanceof From) {
      this._tables.push(tables);
      return this;
    }

    if (Array.isArray(tables)) {
      for (const t of tables) {
        this.from(new From(t));
      }
    } else {
      this.from(new From(tables));
    }
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

  having(where: Having | string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    if (where instanceof Having) {
      this._havings.push(where);
      return this;
    }

    this._havings.push(new Having(where, op, val, 'OR', raw));
    return this;
  }

  group(groups: GroupBy | Array<GroupBy> | string | Array<string>) {
    if (groups instanceof GroupBy) {
      this._groups.push(groups);
      return this;
    }

    if (typeof groups === 'string') {
      this._groups.push(new GroupBy(groups));
      return this;
    }

    for (const g of groups) {
      this.group(g);
    }
    return this;
  }

  order(orders: string | Array<string>) {
    if (orders instanceof OrderBy) {
      this._orders.push(orders);
      return this;
    }

    if (typeof orders === 'string') {
      this._orders.push(new OrderBy(orders));
      return this;
    }

    for (const o of orders) {
      this.order(o);
    }
    return this;
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
