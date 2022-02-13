import { IQueryBuilderParams } from "../types";
import Where, { Val } from "./Where";

export default class Set implements IQueryBuilderParams {
  private col: string;
  private val: Val;
  private raw: boolean;
  private params: Array<any>;

  constructor(col: string, val: Val, raw: boolean = false) {
    this.col = col;
    this.val = val;
    this.raw = raw;
    this.params = [];
  }

  build() {
    this.params = [Where.parseValue(this.val, undefined, this.raw)];
      return {
        query: [
          this.col,
          "=",
          '?',
        ].join(' '),
        params: this.params,
      };
  }
}
