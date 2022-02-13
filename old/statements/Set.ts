import { IQueryBuilder } from "../types";
import Where, { Val } from "./Where";

export default class Set implements IQueryBuilder {
  private col: string;
  private val: Val;
  private raw: boolean;

  constructor(col: string, val: Val, raw: boolean = false) {
    this.col = col;
    this.val = val;
    this.raw = raw;
  }

  build(): string {
      return [
        this.col,
        "=",
        Where.parseValue(this.val, undefined, this.raw),
      ].join(' ');
  }
}
