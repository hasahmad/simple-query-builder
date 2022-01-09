import { IQueryBuilder } from "../types";

export default class GroupBy implements IQueryBuilder {
  private group_by: string;

  constructor(group_by: string) {
    this.group_by = group_by;
  }

  public build() {
    return this.parseGroupBy();
  }

  private parseGroupBy() {
    return this.group_by;
  }
}
