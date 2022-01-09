import { ISTAR } from './constants';

export interface IQueryBuilder {
  build(): string;
}

export type TableName = {[alias: string]: string | IQueryBuilder} | string;
export type Field = {[alias: string]: string | IQueryBuilder} | string;
export type Fields = Array<Field> | ISTAR;
export type OP = 
  '=' | '!=' | '<>'
  | '>' | '>='
  | '<' | '<='
  | 'BETWEEN' | 'NOT BETWEEN'
  | 'LIKE' | 'NOT LIKE'
  | 'IN' | 'NOT IN'
  | 'IS NULL' | 'IS NOT NULL'
  | 'IS' | 'IS NOT'
  | 'NOT';
export type Val = string | number | Date | Array<any> | IQueryBuilder | null;
export type WhereType = 'AND' | 'OR';
export interface IWHERE {
  where: string | IQueryBuilder;
  op?: OP;
  val?: Val;
  type: WhereType;
  raw?: boolean;
}
export type Wheres = Array<IWHERE>;
export type JoinOn = string | IWHERE | Array<IWHERE>;
export type JoinType = "INNER" | "OUTER" | "LEFT" | "RIGHT";
export interface IJoin {
  table: TableName;
  on: JoinOn;
  type: JoinType;
};

export interface IStatement {
  build(): string;
}
