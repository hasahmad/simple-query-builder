import {
  DistinctReturn,
  ExplainReturn,
  FromReturn,
  GroupByReturn,
  HavingReturn,
  IDistinct,
  IExplain,
  IExpression,
  IFrom,
  IGroupBy,
  IHaving,
  IJoin,
  ILimit,
  IOrderBy,
  ISelect,
  IWhere,
  JoinReturn,
  LimitReturn,
  OrderByReturn,
  SelectReturn,
  TColumn,
  TTable,
  WhereReturn
} from "./types";
import Expression from './Expression';
import Join from './Join';
import Where from './Where';
import { parseColumn, parseTable } from "./utils";

export default class Select implements
  IExpression,
  ISelect,
  IExplain,
  IDistinct,
  IFrom,
  IJoin,
  IWhere,
  IGroupBy,
  IHaving,
  IOrderBy,
  ILimit {
  // select columns
  protected columns: Expression[];
  // from tables
  protected fromTables: Expression[];
  // joins
  protected joins: Expression[];
  // wheres
  protected wheres: Expression[];
  // group bys
  protected groupBys: Expression[];
  // havings
  protected havings: Expression[];
  // order bys
  protected orderBys: Expression[];
  // limit
  protected _limit?: number;
  // page
  protected _page?: number;
  // explain
  protected _explain?: boolean;
  // distinct
  protected _distinct?: boolean;

  constructor(
    columns: Expression[] = [],
    tables: Expression[] = [],
  ) {
    this.columns = columns;
    this.fromTables = tables;
    this.joins = [];
    this.wheres = [];
    this.groupBys = [];
    this.havings = [];
    this.orderBys = [];
  }

  getParams(): any[] {
    const columns = this.columns.map(v => v.buildExpression());
    const fromTables = this.fromTables.map(v => v.buildExpression());
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());
    const groupBys = this.groupBys.map(v => v.buildExpression());
    const havings = this.havings.map(v => v.buildExpression());
    const orderBys = this.orderBys.map(v => v.buildExpression());

    return [
      ...columns.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...fromTables.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...joins.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...wheres.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...groupBys.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...havings.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
      ...orderBys.reduce((acc: any[], v: [string, any[]]) => [...acc, ...v[1]], []),
    ];
  }

  getQuery(): string {
    const columns = this.columns.map(v => v.buildExpression());
    const fromTables = this.fromTables.map(v => v.buildExpression());
    const joins = this.joins.map(v => v.buildExpression());
    const wheres = this.wheres.map(v => v.buildExpression());
    const groupBys = this.groupBys.map(v => v.buildExpression());
    const havings = this.havings.map(v => v.buildExpression());
    const orderBys = this.orderBys.map(v => v.buildExpression());

    return ([
      ...(!this._explain ? [] : ['EXPLAIN']),
      'SELECT',
      ...(!this._distinct ? [] : ['DISTINCT']),
      columns.map(v => v[0]).join(', '),
      ...(
        !fromTables.length ? [] : [
          'FROM', fromTables.map(v => v[0]).join(', '),
        ]
      ),
      joins.map(v => v[0]).join(' '),
      ...(
        !wheres.length ? [] : [
          'WHERE', wheres.map(v => v[0]).join(' '),
        ]
      ),
      ...(
        !this.groupBys.length ? [] : [
          'GROUP BY', groupBys.map(v => v[0]).join(',')
        ]
      ),
      ...(
        !this.havings.length ? [] : [
          'HAVING', havings.map(v => v[0]).join(', ')
        ]
      ),
      ...(
        !this.orderBys.length ? [] : [
          'ORDER BY', orderBys.map(v => v[0]).join(', ')
        ]
      ),
      ...(
        !this._limit ? [] : [
          'LIMIT',
          this._limit.toString(),
          this._page ? this._page.toString() : '0'
        ]
      ),
    ]).join(' ').trim();
  }

  buildExpression(): [string, Array<any>] {
    return [this.getQuery(), this.getParams()];
  }

  select(columns: Array<TColumn> = ['*']): SelectReturn {
    columns.forEach(v => {
      this.columns.push(parseColumn(v));
    });
    return this;
  }

  from(tables: TTable | Array<TTable>): FromReturn {
    if (Array.isArray(tables)) {
      tables.forEach(v => {
        this.fromTables.push(parseTable(v));
      });
    } else {
      this.fromTables.push(parseTable(tables));
    }

    return this;
  }

  join(table: TTable, on: string): JoinReturn {
    this.joins.push(
      new Join('INNER', table, on)
    );
    return this;
  }

  joinLeft(table: TTable, on: string): JoinReturn {
    this.joins.push(
      new Join('LEFT', table, on)
    );
    return this;
  }

  joinRight(table: TTable, on: string): JoinReturn {
    this.joins.push(
      new Join('RIGHT', table, on)
    );
    return this;
  }

  joinInner(table: TTable, on: string): JoinReturn {
    return this.join(table, on);
  }

  joinOuter(table: TTable, on: string): JoinReturn {
    this.joins.push(
      new Join('OUTER', table, on)
    );
    return this;
  }

  where(where: string | IExpression, params?: any): WhereReturn {
    this.wheres.push(
      new Where(
        this.wheres.length === 0 ? '' : 'AND',
        where,
        params
      )
    );
    return this;
  }

  orWhere(where: string | IExpression, params?: any): WhereReturn {
    this.wheres.push(
      new Where(
        this.wheres.length === 0 ? '' : 'OR',
        where,
        params
      )
    );
    return this;
  }

  groupBy(groups: string | string[]): GroupByReturn {
    if (typeof groups === 'string') {
      this.groupBys.push(new Expression(groups));
    } else {
      this.groupBys = this.groupBys.concat(
        groups.map(v => new Expression(v))
      );
    }
    return this;
  }

  having(where: string | IExpression, params?: any): HavingReturn {
    this.havings.push(
      new Where(
        this.havings.length === 0 ? '' : 'AND',
        where,
        params
      )
    );
    return this;
  }

  orHaving(where: string | IExpression, params?: any): HavingReturn {
    this.havings.push(
      new Where(
        this.havings.length === 0 ? '' : 'OR',
        where,
        params
      )
    );
    return this;
  }

  orderBy(orders: string | string[]): OrderByReturn {
    if (typeof orders === 'string') {
      this.orderBys.push(new Expression(orders));
    } else {
      this.orderBys = this.orderBys.concat(
        orders.map(v => new Expression(v))
      );
    }
    return this;
  }

  limit(limit: number, page?: number): LimitReturn {
    this._limit = limit;
    this._page = page;
    return this;
  }

  explain(_explain: boolean = true): ExplainReturn {
    this._explain = _explain;
    return this;
  }

  distinct(_distinct: boolean = true): DistinctReturn {
    this._distinct = _distinct;
    return this;
  }
}