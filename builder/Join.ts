import { IQueryBuilder, IJoin, JoinOn, JoinType, TableName } from "../types";
import From from "./From";
import Where from "./Where";

export default class Join implements IQueryBuilder {
  private _join: IJoin;

  constructor(table: TableName, on: JoinOn, type: JoinType = 'INNER') {
    this._join = {table, on, type};
  }

  public build() {
    return this.parseJoin();
  }

  private parseJoin() {
    return [
      `${this._join.type}`,
      'JOIN',
      From.parseTableName(this._join.table),
      'ON',
      Join.parseJoinOn(this._join.on)
    ].join(' ');
  }

  static parseJoinOn(on: JoinOn) {
    if (typeof on === 'string') { return on; }

    if (Array.isArray(on)) {
      return `(${on.map((w, i) => {
        return Where.parseWhere(w, i !== 0);
      }).join(' ')})`;
    }

    return `(${Where.parseWhere(on, false)})`;
  }
}