import { IPredicate } from "../types";

export type Value = string | null;

export default class IsNull implements IPredicate {
  protected predicate: string = "IS NULL";
  private key: string;
  private value?: Value;
  private raw: boolean = false;

  constructor(key: string, value?: Value, raw: boolean = false) {
    this.key = key;
    this.value = value;
    this.raw = raw;
  }

  build() {
    return [
      this.key,
      this.predicate
    ].join(' ');
  }
}
