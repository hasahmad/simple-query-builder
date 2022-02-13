import { IQueryBuilder, IPredicate } from "../types";

export type Value = string | Array<any> | IQueryBuilder;

export default class In implements IPredicate {
  protected predicate: string = "IN";
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
      return this.value;
    }
    if (Array.isArray(this.value)) {
      return `('${this.value.join("', '")}')`;
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
