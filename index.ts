
interface IBaseQueryBuilder {
  build(): string;
}

class BaseQueryBuilder implements IBaseQueryBuilder {
  build() {
    return "";
  }

  toString() {
    return this.build();
  }
}

class QueryBuilder extends BaseQueryBuilder implements IBaseQueryBuilder {
  select() {
    return new SelectQueryBuilder();
  }

  build() {
    return "";
  }

  toString() {
    return this.build();
  }
}

const STAR = "*";
type ISTAR = typeof STAR;

class InvalidTableNameError extends Error {
  constructor() {
    super("Invalid Table Name");
  }
}

type TableName = {[alias: string]: string | BaseQueryBuilder} | string;
type Field = {[alias: string]: string | BaseQueryBuilder} | string;
type Fields = Array<Field> | ISTAR;
type Wheres = Array<IWHERE>;
type OP = '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'IN' | 'IS' | 'IS NOT';
type Val = string | number | Array<any> | BaseQueryBuilder;
interface IWHERE {
  where: string | BaseQueryBuilder;
  op: OP;
  val: Val | null;
  type: 'AND' | 'OR';
  raw?: boolean;
}

class SelectQueryBuilder extends BaseQueryBuilder implements IBaseQueryBuilder {
  private _tables: Array<TableName>;
  private _fields: Fields;
  private _wheres: Wheres;
  private _groups: Array<string>;
  private _orders: Array<string>;
  private _havings: Wheres;
  private _limit?: number;
  private _offset?: number;

  constructor(
    tables: Array<TableName> = [],
    fields: Fields = STAR,
    wheres: Wheres = [],
    groups: Array<string> = [],
    havings: Wheres = [],
    orders: Array<string> = [],
    limit?: number,
    offset?: number,
  ) {
    super();
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

  where(where: string, op: OP = "=", val?: string | number | Array<any> | QueryBuilder, raw: boolean = false) {
    this._wheres.push({where, val, op, type: 'AND', raw});
    return this;
  }

  orWhere(where: string, op: OP = "=", val: string | number | Array<any> | QueryBuilder, raw: boolean = false) {
    this._wheres.push({where, val, op, type: 'OR', raw});
    return this;
  }

  having(where: string, op: OP = "=", val: string | number | Array<any> | QueryBuilder, raw: boolean = false) {
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

  limit(limit: number, offset?: number) {
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
    if (this._limit > 0) {
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
        val instanceof BaseQueryBuilder
          ? "(" + val.build() + ")"
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
        val instanceof BaseQueryBuilder
          ? "(" + val.build() + ")"
          : val
      } AS ${k}`;
    }).join(', ');
  }

  private parseWheres() {
    return this._wheres.map((w, i) => {
      return this.parseWhere(w, i !== 0);
    }).join(' ');
  }

  private parseWhere(w: IWHERE, prepend = true) {
    const result = w.where instanceof BaseQueryBuilder
      ? `(${w.where.build()})`
      : `(${w.where} ${w.op} ${this.parseValue(w.val, w.op, w.raw)})`;
    return !prepend ? result : `${w.type} ${result}`;
  }

  private parseValue(val: Val, op?: string, raw: boolean = false) {
    return typeof val === 'number' || raw
    ? `${val}`
    : (typeof val === 'object' && Array.isArray(val)) || op === 'IN'
    ? `(${Array.isArray(val) ? "'" + val.join("','") + "'" : val})`
    : typeof val === 'object' && val instanceof BaseQueryBuilder
    ? `${val.build()}`
    : val === null || (typeof val === 'string' && val.toLowerCase() === 'null')
    ? `NULL`
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
    if (typeof this._offset === 'undefined' || !isNaN(this._offset)) {
      return `${this._limit}`;
    }

    return `${this._limit} ${this._offset}`;
  }
}


const query = new SelectQueryBuilder()
  .select(["u.user_id", "u.username", "ur.role_id"])
  .from({ 'u': 'users' })
  .from({ 'ur': 'user_roles' })
  .from({
    'up': (new SelectQueryBuilder())
      .select()
      .from({'p': 'permissions'})
      .where('p.removed_at', 'IS', 'null')
  })
  .where('u.user_id', '=', 'ur.user_id', true)
  .orWhere('u.role_id', 'IN', (new SelectQueryBuilder())
    .select(["r.role_id"])
    .from({'r': 'roles'})
    .where('r.removed_at', 'IS', 'null')
  )
  .where('u.username', 'IS NOT', null)
  ;

console.log(query.build());

