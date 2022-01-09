import { IQueryBuilder, IJoin, JoinOn, JoinType, TableName } from "../types";
import From from "./From";
import Where from "./Where";

export default class Join implements IQueryBuilder {
  private table: TableName;
  private on: JoinOn;
  private type: JoinType;

  constructor(table: TableName, on: JoinOn, type: JoinType = 'INNER') {
    this.table = table;
    this.on = on;
    this.type = type;
  }

  public build() {
    return this.parseJoin();
  }

  private parseJoin() {
    return [
      `${this.type}`,
      'JOIN',
      From.parseTableName(this.table),
      'ON',
      Join.parseJoinOn(this.on)
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