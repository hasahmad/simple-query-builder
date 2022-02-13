import InvalidValueError from "../exceptions/InvalidValueError";
import { Between, BetweenValue, In, InValue, IsNotNull, IsNull, IsNullValue, Like, LikeValue, NotBetween, NotIn, NotLike } from "../predicate";
import { IQueryBuilder } from "../types";

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
export type Val = string | number | Date | Array<any> | IQueryBuilder | null;
export type WhereType = 'AND' | 'OR';
export interface IWHERE {
  where: string | IQueryBuilder;
  op?: OP;
  val?: Val;
  type: WhereType;
  raw?: boolean;
}

export default class Where implements IQueryBuilder, IWHERE {
  where: string | IQueryBuilder;
  op?: OP;
  val?: Val;
  type: WhereType;
  raw?: boolean;

  constructor(where: string | IQueryBuilder, op: OP = "=", val?: Val, type: WhereType = 'AND', raw: boolean = false) {
    this.where = where;
    this.op = op;
    this.val = val;
    this.type = type;
    this.raw = raw;
    return this;
  }

  public build(prepend = true) {
    return Where.parseWhere({
      where: this.where,
      val: this.val,
      op: this.op,
      type: this.type,
      raw: this.raw
    } as IWHERE, prepend);
  }

  static parseWhere(w: IWHERE, prepend = true) {
    let result = "";
    if (typeof w.where === 'string') {
      if (w.val === undefined && !['IS NULL', 'IS NOT NULL',].includes(w.op || '')) {
        throw new InvalidValueError();
      }

      switch (w.op) {
        case 'BETWEEN':
          result = new Between(w.where, w.val as BetweenValue, w.raw).build();
          break;
        case 'NOT BETWEEN':
          result = new NotBetween(w.where, w.val as BetweenValue, w.raw).build();
          break;
        case 'IS NULL':
          result = new IsNull(w.where, w.val as IsNullValue, w.raw).build();
          break;
        case 'IS NOT NULL':
          result = new IsNotNull(w.where, w.val as IsNullValue, w.raw).build();
          break;
        case 'LIKE':
          result = new Like(w.where, w.val as LikeValue, w.raw).build();
          break;
        case 'NOT LIKE':
          result = new NotLike(w.where, w.val as LikeValue, w.raw).build();
          break;
        case 'IN':
          result = new In(w.where, w.val as InValue, w.raw).build();
          break;
        case 'NOT IN':
          result = new NotIn(w.where, w.val as InValue, w.raw).build();
          break;
        default:
          result = `(${w.where} ${w.op} ${Where.parseValue(w.val as Val, w.op, w.raw)})`;
          break;
      }
    } else {
      result = `(${w.where.build()})`;
    }
    return !prepend ? result : `${w.type} ${result}`;
  }

  static parseValue(val: Val, op?: OP, raw: boolean = false) {
    if (typeof val === 'number' || raw) {
      return `${val}`;
    }

    if (val === null || (typeof val === 'string' && val.toLowerCase() === 'null')) {
      return `NULL`;
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