import InvalidValueError from "../../exceptions/InvalidValueError";
import { IQueryBuilderParams, IPredicateParams } from "../types";

type Val = string | number | Date | IQueryBuilderParams;
export type Value = [ Val, Val ];

export default class Between implements IPredicateParams {
  protected predicate: string = "BETWEEN";
  private key: string;
  private values: Value;
  private raw: boolean = false;
  private params: Array<any>;

  // values could be 'date1 and date2' | [date1, date2] | Builder().select([{'val': "concat(date1, ' and ', date2)"}]).from(...)...
  constructor(key: string, values: Value, raw: boolean = false) {
    this.key = key;
    this.values = values;
    this.raw = raw;
    this.params = [];
  }

  parseValues() {
    if (this.values.length > 2) {
      throw new InvalidValueError('must be array if length 2');
    }
    return this.values.map(v => {
      this.params.push(this.parseValue(v));
      return '?';
    }).join(' AND ');
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
        throw new InvalidValueError(val);
      }
      return `'${val.toISOString()}'`;
    }

    return `(${val.build()})`;
  }

  build() {
    return {
      query: [
        this.key,
        this.predicate,
        this.parseValues(),
      ].join(' '),
      params: this.params,
    };
  }
}
