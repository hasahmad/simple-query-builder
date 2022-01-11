import { IQueryBuilderParams } from "../types";

export default class GroupBy implements IQueryBuilderParams {
  private group_by: string;
  private params: Array<any>;

  constructor(group_by: string | IQueryBuilderParams) {
    if (typeof group_by === 'string') {
      this.group_by = group_by;
      this.params = [];
    } else {
      this.group_by = group_by.build().query;
      this.params = group_by.build().params;
    }
  }

  public build() {
    return {
      query: this.group_by,
      params: this.params,
    };
  }
}
