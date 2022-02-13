import { IQueryBuilder } from "../types";
import From, { TableName } from "./From";
import Where from "./Where";

export type JoinOn = string | Where | Array<Where>;
export type JoinType = "INNER" | "OUTER" | "LEFT" | "RIGHT";
export interface IJoin {
  table: TableName;
  on: JoinOn;
  type: JoinType;
};

export default class Join implements IQueryBuilder, IJoin {
  table: TableName;
  on: JoinOn;
  type: JoinType;

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
        return w.build(i !== 0);
      }).join(' ')})`;
    }

    return `(${on.build(false)})`;
  }
}