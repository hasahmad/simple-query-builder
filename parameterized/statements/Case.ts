import { IQueryBuilderParams } from "../types";
import { Val } from "./Where";

export default class Case implements IQueryBuilderParams {
  private whens: {[key: string]: Val};
  private _else: string | IQueryBuilderParams;
  private params: Array<any>;

  constructor(whens: {[key: string]: Val}, _else: string | IQueryBuilderParams) {
    this.whens = whens;
    this._else = _else;
    this.params = [];
  }

  public build() {
    return {
      query: [
        "CASE",
        ...this.parseWhens(this.whens),
        "ELSE",
        ...this.parseElse(this._else),
        "END",
      ].join(' '),
      params: this.params,
    };
  }

  parseWhens(whens: {[key: string]: Val}) {
    return Object.keys(whens).map(k => {
      const val = whens[k];
      if (typeof val === 'string' || typeof val === 'number' || val instanceof Date) {
        this.params.push(val);
        return `WHEN ${k} THEN ?`;
      }

      if (Array.isArray(val)) {
        this.params.push(val);
        return `WHEN ${k} THEN (?)`;
      }

      if (val === null) {
        this.params.push(val);
        return `WHEN ${k} THEN ?`;
      }

      const b = val.build();
      this.params.push(...b.params);
      return `WHEN ${b.query} THEN (?)`;
    });
  }

  parseElse(_else: string | IQueryBuilderParams) {
    if (typeof _else === 'string') {
      this.params.push(_else);
      return '?';
    }

    const b = _else.build();
    this.params.push(...b.params);
    return b.query;
  }
}
