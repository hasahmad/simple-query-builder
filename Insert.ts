import {
  IExpression,
  TTable,
} from "./types";
import Expression from './Expression';
import Join from './Join';
import Where from './Where';
import { isIExpression } from "./utils";

export type IData = Array<{[key: string]: any}> | IExpression;

export default class Insert implements IExpression {
  protected table!: string;
  protected columns: string[];
  protected joins: Expression[];
  protected wheres: Expression[];
  protected _dataQuery!: string;
  protected _dataParams: Array<any | Array<any>>;

  constructor() {
    this.columns = [];
    this.joins = [];
    this.wheres = [];
    this._dataParams = [];
  }

  getParams(): any[] {
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      ...this._dataParams,
      ...joins.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...wheres.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
    ];
  }

  getQuery(): string {
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());

    return [
      'INSERT',
      'INTO',
      this.table,
      ...(!this.columns.length ? [] : [`(${this.columns.join(',')})`]),
      'VALUES',
      this._dataQuery,
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
    if (isIExpression(data)) {
      this._dataQuery = `(${data.getQuery()})`;
      this._dataParams = data.getParams();
    } else {
      if (!this.columns.length) {
        this.columns = Object.keys(data[0]);
      }

      this._dataQuery = '('
        + data.map(
            () => (new Array(this.columns.length)).fill('?').join(',')
          ).join('),(')
        + ')'

      this._dataParams = data
        .map(v => {
          const val: any[] = [];
          this.columns.forEach(k => {
            val.push(v[k]);
          })
          return val;
        })
        .reduce((acc, v) => ([...acc, ...v]), []);
    }

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
