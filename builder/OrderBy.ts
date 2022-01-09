import { IQueryBuilder } from "../types";

export default class OrderBy implements IQueryBuilder {
  private _order_by: string;

  constructor(order_by: string) {
    this._order_by = order_by;
  }

  public build() {
    return this.parseOrderBy();
  }

  private parseOrderBy() {
    return this._order_by;
  }
}
