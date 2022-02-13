import {
  IExpression,
  TTable,
} from "./types";
import Expression from './Expression';
import Join from './Join';
import Where from './Where';
import { isIExpression } from "./utils";

export default class Delete implements IExpression {
  protected table!: string;
  protected joins: Expression[];
  protected wheres: Expression[];

  constructor() {
    this.joins = [];
    this.wheres = [];
  }

  getParams(): any[] {
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      ...joins.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...wheres.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
    ];
  }

  getQuery(): string {
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      'DELETE',
      'FROM',
      this.table,
      joins.map(v => v[0]).join(' '),
      ...(!this.wheres.length ? [] : [
        'WHERE', wheres.map(v => v[0]).join(' '),
      ]),
    ].join(' ').trim();
  }

  buildExpression(): [string, Array<any>] {
    return [this.getQuery(), this.getParams()];
  }

  from(table: string) {
    this.table = table;
    return this;
  }

  join(table: TTable, on: string) {
    this.joins.push(
      new Join('INNER', table, on)
    );
    return this;
  }

  joinLeft(table: TTable, on: string) {
    this.joins.push(
      new Join('LEFT', table, on)
    );
    return this;
  }

  joinRight(table: TTable, on: string) {
    this.joins.push(
      new Join('RIGHT', table, on)
    );
    return this;
  }

  joinInner(table: TTable, on: string) {
    return this.join(table, on);
  }

  joinOuter(table: TTable, on: string) {
    this.joins.push(
      new Join('OUTER', table, on)
    );
    return this;
  }

  where(where: string | IExpression, params?: any) {
    this.wheres.push(
      new Where(
        this.wheres.length === 0 ? '' : 'AND',
        where,
        params
      )
    );
    return this;
  }

  orWhere(where: string | IExpression, params?: any) {
    this.wheres.push(
      new Where(
        this.wheres.length === 0 ? '' : 'OR',
        where,
        params
      )
    );
    return this;
  }
}
