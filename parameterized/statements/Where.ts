import InvalidValueError from "../../exceptions/InvalidValueError";
import { Between, BetweenValue, In, InValue, IsNotNull, IsNull, IsNullValue, Like, LikeValue, NotBetween, NotIn, NotLike } from "../predicate";
import { IQueryBuilderParams } from "../types";

export type OP = 
  '=' | '!=' | '<>'
  | '>' | '>='
  | '<' | '<='
  | 'BETWEEN' | 'NOT BETWEEN'
  | 'LIKE' | 'NOT LIKE'
  | 'IN' | 'NOT IN'
  | 'IS NULL' | 'IS NOT NULL'
  | 'IS' | 'IS NOT'
  | 'NOT';
export type Val = string | number | Date | Array<any> | IQueryBuilderParams | null;
export type WhereType = 'AND' | 'OR';
export interface IWHERE {
  where: string | IQueryBuilderParams;
  op?: OP;
  val?: Val;
  type: WhereType;
  raw?: boolean;
}

export default class Where implements IQueryBuilderParams, IWHERE {
  where: string | IQueryBuilderParams;
  op?: OP;
  val?: Val;
  type: WhereType;
  raw?: boolean;
  private params: Array<any>;

  constructor(where: string | IQueryBuilderParams, op: OP = "=", val?: Val, type: WhereType = 'AND', raw: boolean = false) {
    this.where = where;
    this.op = op;
    this.val = val;
    this.type = type;
    this.raw = raw;
    this.params = [];
  }

  public build(prepend = true) {
    return this.parseWhere({
      where: this.where,
      val: this.val,
      op: this.op,
      type: this.type,
      raw: this.raw
    } as IWHERE, prepend);
  }

  parseWhere(w: IWHERE, prepend = true) {
    let query = "";
    let qry = {
      query: '', params: [] as Array<any>,
    };
    if (typeof w.where === 'string') {
      if (w.val === undefined && !['IS NULL', 'IS NOT NULL',].includes(w.op || '')) {
        throw new InvalidValueError();
      }

      switch (w.op) {
        case 'BETWEEN':
          qry = new Between(w.where, w.val as BetweenValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'NOT BETWEEN':
          qry = new NotBetween(w.where, w.val as BetweenValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'IS NULL':
          qry = new IsNull(w.where, w.val as IsNullValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'IS NOT NULL':
          qry = new IsNotNull(w.where, w.val as IsNullValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'LIKE':
          qry = new Like(w.where, w.val as LikeValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'NOT LIKE':
          qry = new NotLike(w.where, w.val as LikeValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'IN':
          qry = new In(w.where, w.val as InValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        case 'NOT IN':
          qry = new NotIn(w.where, w.val as InValue, w.raw).build();
          query = qry.query;
          this.params = qry.params;
          break;
        default:
          query = `(${w.where} ${w.op} ?)`;
          this.params = [Where.parseValue(w.val as Val, w.op, w.raw)];
          break;
      }
    } else {
      qry = w.where.build();
      query = `(${qry.query})`;
      this.params = qry.params;
    }

    return {
      query: !prepend ? query : `${w.type} ${query}`,
      params: this.params,
    };
  }

  static parseValue(val: Val, op?: OP, raw: boolean = false) {
    if (typeof val === 'number' || raw) {
      return `${val}`;
    }

    if (val === null || (typeof val === 'string' && val.toLowerCase() === 'null')) {
      return null;
    }

    if ((typeof val === 'object' && Array.isArray(val)) || op === 'IN' || op === 'NOT IN') {
      return `(${Array.isArray(val) ? "'" + val.join("','") + "'" : val})`;
    }

    if (val instanceof Date) {
      if (Object.prototype.toString.call(val) !== "[object Date]") {
        throw new InvalidValueError(val);
      }
      return `'${val.toISOString()}'`;
    }

    if (typeof val === 'object' && val.build) {
      return `${val.build()}`;
    }

    return `'${val}'`;
  }
}