import Expression from "./Expression";
import { IExpression } from "./types";
import { isIExpression } from "./utils";

export default class Where extends Expression {
  constructor(
    whereJoiner: '' | 'AND' | 'OR',
    where: string | IExpression,
    params?: any,
    wrapBracket: boolean = true
  ) {
    super('', []);

    if (typeof where === 'string') {
      let whereQuery = where;
      if (isIExpression(params)) {
        const [_whereQuery, _whereParams] = params.buildExpression();
        whereQuery = whereQuery.replace('{{?}}', _whereQuery);
        this.setParams(_whereParams);
      }

      this.setQuery([
        whereJoiner,
        (wrapBracket ? '(' : '')
        + whereQuery
        + (wrapBracket ? ')' : '')
      ].join(' ').trim());

      if (typeof params === 'undefined'
        || isIExpression(params)
      ) {
        return;
      }

      this.setParams([params]);
      return;
    }

    const [whereQuery, whereParams] = where.buildExpression();
    this.setQuery([
      whereJoiner,
      (wrapBracket ? '(' : '')
      + whereQuery
      + (wrapBracket ? ')' : '')
    ].join(' ').trim());
    this.setParams(whereParams);
    if (typeof params !== 'undefined') {
      this.setParams([params]);
    }
  }
}