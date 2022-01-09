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
import InvalidValueError from './exceptions/InvalidValueError';
import {
  From,
  Field,
  Where,
  Join,
  Having,
  GroupBy,
  OrderBy,
} from './builder';

export type QueryType = "SELECT" | "INSERT" | "UPDATE" | "DELETE";

export default class Query implements IQueryBuilder {
  protected _type: QueryType;
  protected _tables: Array<From>;
  protected _fields: Array<Field>;
  protected _wheres: Array<Where>;
  protected _joins: Array<Join>;
  protected _groups: Array<GroupBy>;
  protected _orders: Array<OrderBy>;
  protected _havings: Array<Having>;

  constructor(
    type: QueryType = "SELECT",
    tables: Array<From> | string = [],
    fields: Array<Field> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    groups: Array<GroupBy> = [],
    orders: Array<OrderBy> = [],
    havings: Array<Having> = []
  ) {
    this._type = type;
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
  }

  type(type: QueryType) {
    this._type = type;
    return this;
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

  from(tables: From | TableName | Array<From> | Array<TableName>) {
    if (Array.isArray(tables)) {
      return this.tables(tables);
    }

    return this.table(tables);
  }

  table(tables: From | TableName) {
    if (tables instanceof From) {
      this._tables.push(tables);
      return this;
    }

    this.from(new From(tables));
    return this;
  }

  tables(tables: Array<From> | Array<TableName>) {
    for (const t of tables) {
      this.table(t);
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

  build() {
    return "";
  }

  toString() {
    return this.build();
  }
}
