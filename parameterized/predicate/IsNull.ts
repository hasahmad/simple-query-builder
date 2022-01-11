import { IPredicateParams } from "../types";

export type Value = string | null;

export default class IsNull implements IPredicateParams {
  protected predicate: string = "IS NULL";
  private key: string;
  private value?: Value;
  private raw: boolean = false;
  private params: Array<any>;

  constructor(key: string, value?: Value, raw: boolean = false) {
    this.key = key;
    this.value = value;
    this.raw = raw;
    this.params = [];
  }

  build() {
    return {
      query: [
        this.key,
        this.predicate
      ].join(' '),
      params: this.params,
    };
  }
}
