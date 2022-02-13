
export interface IBuildExpression {
  buildExpression(): [string, Array<any>];
}

export interface IExpression extends IBuildExpression {
  getParams(): any[];
  getQuery(): string;
}

export type TColumn = IExpression | string | { [key: string]: IExpression | string };
export type TTable = IExpression | string | { [key: string]: IExpression | string };

export type SelectReturn = IExpression & IExplain & IDistinct & IFrom;
export type ExplainReturn = IExpression & IDistinct & IFrom;
export type DistinctReturn = IExpression & IFrom;
export type FromReturn = IExpression & IJoin & IWhere;
export type JoinReturn = IExpression & IJoin & IWhere;
export type WhereReturn = IExpression & IWhere & IGroupBy & IOrderBy & ILimit;
export type GroupByReturn = IExpression & IHaving & IOrderBy & ILimit;
export type HavingReturn = IExpression & IHaving & IOrderBy & ILimit;
export type OrderByReturn = IExpression & ILimit;
export type LimitReturn = IExpression;

export type IntoReturn = IExpression & IJoin & IWhere;

export interface ISelect {
  select(columns?: Array<TColumn>): SelectReturn;
};

export interface IExplain {
  explain(_explain?: boolean): ExplainReturn;
}

export interface IDistinct {
  distinct(_distinct?: boolean): DistinctReturn;
}

export interface IFrom {
  from(tables: TTable | Array<TTable>): FromReturn;
};

export interface IJoin {
  join(table: TTable, on: string): JoinReturn;
  joinLeft(table: TTable, on: string): JoinReturn;
  joinRight(table: TTable, on: string): JoinReturn;
  joinInner(table: TTable, on: string): JoinReturn;
  joinOuter(table: TTable, on: string): JoinReturn;
};

export interface IWhere {
  where(where: string | IExpression, params?: any): WhereReturn;
  orWhere(where: string | IExpression, params?: any): WhereReturn;
}

export interface IGroupBy {
  groupBy(groups: string | string[]): GroupByReturn;
}

export interface IHaving {
  having(where: string | IExpression, params?: any): HavingReturn;
  orHaving(where: string | IExpression, params?: any): HavingReturn;
}

export interface IOrderBy {
  orderBy(orders: string | string[]): OrderByReturn;
}

export interface ILimit {
  limit(limit: number, page?: number): LimitReturn;
}

export type TValue = string
  | Date
  | number
  | boolean
  | { value: any, raw?: boolean, type?: string }
  | null
  | Array<TValue>

