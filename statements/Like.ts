import { IQueryBuilder, IStatement } from "../types";

export type Value = string | IQueryBuilder;

export default class Like implements IStatement {
  protected predicate: string = "LIKE";
  private key: string;
  private value: Value;
  private raw: boolean = false;

  constructor(key: string, value: Value, raw: boolean = false) {
    this.key = key;
    this.value = value;
    this.raw = raw;
  }

  parseValue() {
    if (typeof this.value === 'string') {
      return this.raw ? this.value : `'${this.value}'`;
    }
    return `(${this.value.build()})`;
  }

  build() {
    return [
      this.key,
      this.predicate,
      this.parseValue(),
    ].join(' ');
  }
}
