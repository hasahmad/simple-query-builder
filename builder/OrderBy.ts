import { IQueryBuilder } from "../types";

export default class OrderBy implements IQueryBuilder {
  private order_by: string;

  constructor(order_by: string) {
    this.order_by = order_by;
  }

  public build() {
    return this.parseOrderBy();
  }

  private parseOrderBy() {
    return this.order_by;
  }
}
