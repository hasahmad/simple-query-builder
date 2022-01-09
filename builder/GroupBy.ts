import { IQueryBuilder } from "../types";

export default class GroupBy implements IQueryBuilder {
  private _group_by: string;

  constructor(group_by: string) {
    this._group_by = group_by;
  }

  public build() {
    return this.parseGroupBy();
  }

  private parseGroupBy() {
    return this._group_by;
  }
}
