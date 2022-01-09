import { ISTAR } from './constants';

export interface IQueryBuilder {
  build(): string;
}

export type TableName = {[alias: string]: string | IQueryBuilder} | string;
export type Field = {[alias: string]: string | IQueryBuilder} | string;
export type Fields = Array<Field> | ISTAR;
export type Wheres = Array<IWHERE>;
export type OP = '=' | '!=' | '<>' | '>' | '>=' | '<' | '<=' | 'BETWEEN' | 'LIKE' | 'IN' | 'IS' | 'IS NOT';
export type Val = string | number | Array<any> | IQueryBuilder | null;
export interface IWHERE {
  where: string | IQueryBuilder;
  op?: OP;
  val?: Val;
  type: 'AND' | 'OR';
  raw?: boolean;
}
