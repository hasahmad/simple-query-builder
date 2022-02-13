import Expression from "./Expression";
import { IExpression, TColumn, TTable, TValue } from "./types";


export function parseColumn(column: TColumn): Expression {
  if (column instanceof Expression) {
    return column;
  }

  if (typeof column === 'string') {
    return new Expression(column);
  } else if (typeof column === 'object' && !isIExpression(column)) {
    const key = Object.keys(column)[0];
    const val = column[key];
    if (typeof val === 'string') {
      return new Expression(`${val} as ${key}`);
    }
    return new Expression(`${val.getQuery()} as ${key}`, val.getParams());
  }

  return new Expression(column);
}

export function parseTable(table: TTable): Expression {
  return parseColumn(table);
}

export function isIExpression(val: unknown): val is IExpression {
  if (typeof val !== 'object') { return false; }

  return val instanceof Expression
    || (
      typeof (val as IExpression).buildExpression === 'function'
      && typeof (val as IExpression).getQuery === 'function'
      && typeof (val as IExpression).getParams === 'function'
    );
}

function isDate(value: any): value is Date {
  return value instanceof Date && Object.prototype.toString.call(value) === '[object Date]';
}

export function parseValue(value: any, raw: boolean = false, type: string | null = null): string {
    if (raw) {
        return `${value}`;
    }

    const _isDate = (type === 'date') || (!type && isDate(value));
    const isNull = (type === 'null') || (!type && value === null) || value === 'NULL' || value === 'null';
    const isString = (type === 'string') || (!type && typeof value === 'string');
    const isBool = (type === 'boolean') || (!type && typeof value === 'boolean');
    const isNumber = (type === 'number') || (!type && typeof value === 'number');
    const isArray = (!type  || type === 'array') && Array.isArray(value);

    if (isNull) {
        return `NULL`;
    }

    if (isNumber) {
        return `${value}`;
    }

    if (_isDate && typeof value.toISOString === 'function') {
      return `'${value.toISOString()}'`;
    }

    if (isString) {
        return `'${value}'`;
    }

    if (isBool) {
        return `${value}`;
    }

    if (isArray) {
        return (value as TValue[]).map((v: TValue) => {
            if (v && typeof v === 'object' && !Array.isArray(v) && !isDate(v)) {
                return parseValue(v.value || v, v.raw || false, v.type);
            }

            return parseValue(v);
        }).join(',');
    }

    return `${value}`;
}

