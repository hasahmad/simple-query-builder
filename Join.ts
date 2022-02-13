import Expression from "./Expression";
import { TTable, IExpression } from "./types";

export default class Join extends Expression {
  constructor(
    joinType: 'LEFT' | 'RIGHT' | 'INNER' | 'OUTER',
    table: TTable,
    on: IExpression | string
  ) {
    super('', []);

    const [tableQuery, tableParams] = parseColumn(table).buildExpression();

    let onQuery: string = '';
    let onParams: any[] = [];
    if (typeof on === 'string') {
      onQuery = on;
    } else {
      const onExpr = on.buildExpression();
      onQuery = onExpr[0];
      onParams = onExpr[1];
    }

    this.setQuery([
      joinType,
      'JOIN',
      tableQuery,
      'ON',
      onQuery
    ].join(' ').trim());
    this.setParams([
      ...tableParams,
      ...onParams
    ]);
  }
}
