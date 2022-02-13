import { IQueryBuilderParams } from "../types";
import From, { TableName } from "./From";
import Where from "./Where";

export type JoinOn = string | Where | Array<Where>;
export type JoinType = "INNER" | "OUTER" | "LEFT" | "RIGHT";
export interface IJoin {
  table: TableName;
  on: JoinOn;
  type: JoinType;
};

export default class Join implements IQueryBuilderParams, IJoin {
  table: TableName;
  on: JoinOn;
  type: JoinType;
  private params: Array<any>;

  constructor(table: TableName, on: JoinOn, type: JoinType = 'INNER') {
    this.table = table;
    this.on = on;
    this.type = type;
    this.params = [];
  }

  public build() {
    return this.parseJoin();
  }

  private parseJoin() {
    const f = From.parseTableName(this.table);
    this.params.push(...f.params);
    return {
      query: [
        `${this.type}`,
        'JOIN',
        f.query,
        'ON',
        this.parseJoinOn(this.on)
      ].join(' '),
      params: this.params,
    };
  }

  parseJoinOn(on: JoinOn) {
    if (typeof on === 'string') {
      this.params = [on];
      return '(?)';
    }

    if (Array.isArray(on)) {
      return on.map((w, i) => {
        const b = w.build(i !== 0);
        this.params.push(...b.params);
        return b.query;
      }).join(' ');
    }

    const qry = on.build(false);
    this.params = qry.params;
    return `(${qry.query})`;
  }
}
