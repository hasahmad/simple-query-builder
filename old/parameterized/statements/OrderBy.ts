import { IQueryBuilderParams } from "../types";

export default class OrderBy implements IQueryBuilderParams {
  private order_by: string;
  private params: Array<any>;

  constructor(order_by: string | IQueryBuilderParams) {
    if (typeof order_by === 'string') {
      this.order_by = order_by;
      this.params = [];
    } else {
      this.order_by = order_by.build().query;
      this.params = order_by.build().params;
    }
  }

  public build() {
    return {
      query: this.order_by,
      params: this.params,
    };
  }
}
