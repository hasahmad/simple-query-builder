import {
  IExpression,
  TTable,
} from "./types";
import Expression from './Expression';
import Join from './Join';
import Where from './Where';
import { isIExpression } from "./utils";

export type IData = Array<any> | IExpression;

export default class Insert implements IExpression {
  protected table!: string;
  protected columns: string[];
  protected data!: IData;
  protected joins: Expression[];
  protected wheres: Expression[];

  constructor() {
    this.columns = [];
    this.joins = [];
    this.wheres = [];
  }

  getParams(): any[] {
    let data = [];
    if (isIExpression(this.data)) {
      data = this.data.getParams();
    } else {
      data.push(this.data);
    }

    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      ...data,
      ...joins.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...wheres.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
    ];
  }

  getQuery(): string {
    let data = '';
    if (isIExpression(this.data)) {
      data = this.data.getQuery();
    } else {
      data = '?';
    }

    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      'INSERT',
      'INTO',
      this.table,
      ...(!this.columns.length ? [] : [`(${this.columns.join(',')})`]),
      'VALUES',
      `(${data})`,
      joins.map(v => v[0]).join(' '),
      ...(!this.wheres.length ? [] : [
        'WHERE', wheres.map(v => v[0]).join(' '),
      ]),
    ].join(' ').trim();
  }

  buildExpression(): [string, Array<any>] {
    return [this.getQuery(), this.getParams()];
  }

  into(table: string, columns: string[] = []) {
    this.table = table;
    this.columns = columns;
    return this;
  }

  values(data: IData) {
    this.data = data;
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
