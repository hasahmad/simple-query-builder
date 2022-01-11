import { IQueryBuilderParams, IPredicateParams } from "../types";

export type Value = string | Array<any> | IQueryBuilderParams;

export default class In implements IPredicateParams {
  protected predicate: string = "IN";
  private key: string;
  private value: Value;
  private raw: boolean = false;
  private params: Array<any>;

  constructor(key: string, value: Value, raw: boolean = false) {
    this.key = key;
    this.value = value;
    this.raw = raw;
    this.params = [];
  }

  parseValue() {
    if (typeof this.value === 'string') {
      this.params = [this.value];
      return '?';
    }
    if (Array.isArray(this.value)) {
      this.params = [this.value.join("', '")];
      return '(?)';
    }
    const b = this.value.build();
    this.params = b.params;
    return b.query;
  }

  build() {
    return {
      query: [
        this.key,
        this.predicate,
        this.parseValue(),
      ].join(' '),
      params: this.params,
    };
  }
}
