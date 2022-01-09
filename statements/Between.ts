import InvalidValueError from "../exceptions/InvalidValueError";
import { IQueryBuilder, IStatement } from "../types";

type Val = string | number | Date | IQueryBuilder;
export type Value = Array<Val> | string | IQueryBuilder;

export default class Between implements IStatement {
  protected predicate: string = "BETWEEN";
  private key: string;
  private values: Value;
  private raw: boolean = false;

  // values could be 'date1 and date2' | [date1, date2] | Builder().select([{'val': "concat(date1, ' and ', date2)"}]).from(...)...
  constructor(key: string, values: Value, raw: boolean = false) {
    this.key = key;
    this.values = values;
    this.raw = raw;
  }

  parseValues() {
    if (typeof this.values === 'string') {
      return `${this.values}`;
    }
    if (Array.isArray(this.values)) {
      if (this.values.length > 2) {
        throw new InvalidValueError();
      }
      return this.values.map(this.parseValue).join(' AND ');
    }

    return `(${this.values.build()})`;
  }

  parseValue(val: Val) {
    if (typeof val === 'string') {
      return this.raw ? `${val}` : `'${val}'`;
    }
    if (typeof val === 'number') {
      return `${val}`;
    }
    if (val instanceof Date) {
      if (Object.prototype.toString.call(val) !== "[object Date]") {
        throw new InvalidValueError();
      }
      return `'${val.toISOString()}'`;
    }

    return `(${val.build()})`;
  }

  build() {
    return [
      this.key,
      this.predicate,
      this.parseValues(),
    ].join(' ');
  }
}
