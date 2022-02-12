
type TColumn = IExpression | string | { [key: string]: IExpression | string };
type TTable = IExpression | string | { [key: string]: IExpression | string };

interface IExpression {
    getParams(): any[];
    getQuery(): string;
    buildExpression(): [string, Array<any>];
}

class Expression implements IExpression {
    query!: string;
    params: any[] = [];

    constructor(query: IExpression | string, params: any[] = [])
    {
        this.setQuery(query);
        this.setParams(params);
    }

    setQuery(query: IExpression | string)
    {
        if (typeof query === 'string') {
            this.query = query;
        } else {
            const [qry, params] = query.buildExpression();
            this.query = qry;
            this.params = this.params.concat(params);
        }

        return this;
    }

    setParams(params?: any[])
    {
        if (typeof params === 'undefined') {
            return;
        }

        this.params = this.params.concat(params);
        return this;
    }

    getParams(): any[]
    {
        return this.params;
    }

    getQuery(): string
    {
        return this.query;
    }

    buildExpression(): [string, Array<any>]
    {
        return [this.getQuery(), this.getParams()];
    }
}

class Join extends Expression
{
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

class Where extends Expression
{
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

class Select implements IExpression
{
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

        return (
            this._explain ? ['EXPLAIN'] : []
        ).concat(
            this._distinct ? ['DISTINCT'] : []
        ).concat([
            'SELECT',
            columns.map(v => v[0]).join(', '),
            'FROM',
            fromTables.map(v => v[0]).join(', '),
            joins.map(v => v[0]).join(' '),
            'WHERE',
            wheres.map(v => v[0]).join(' '),
        ]).concat(
            this.groupBys.length === 0
                ? []
                : ['GROUP BY', groupBys.map(v => v[0]).join(',')],
        ).concat(
            this.havings.length === 0
                ? []
                : ['HAVING', havings.map(v => v[0]).join(', ')],
        ).concat(
            this.orderBys.length === 0
                ? []
                : ['ORDER BY', orderBys.map(v => v[0]).join(', ')],
        ).concat(
            !this._limit
                ? []
                : [
                    'LIMIT',
                    this._limit.toString(),
                    this._page ? this._page.toString() : '0'
                ],
        ).join(' ');
    }

    buildExpression(): [string, Array<any>]
    {
        return [this.getQuery(), this.getParams()];
    }

    select(columns: Array<TColumn> = ['*'])
    {
        columns.forEach(v => {
            this.columns.push(parseColumn(v));
        });
        return this;
    }

    from(tables: TTable | Array<TTable>)
    {
        if (Array.isArray(tables)) {
            tables.forEach(v => {
                this.fromTables.push(parseTable(v));
            });
            return this;
        }

        this.fromTables.push(parseTable(tables));
        return this;
    }

    join(table: TTable, on: string)
    {
        this.joins.push(
            new Join('INNER', table, on)
        );
        return this;
    }

    joinLeft(table: IExpression | string, on: string)
    {
        this.joins.push(
            new Join('LEFT', table, on)
        );
        return this;
    }

    joinRight(table: IExpression | string, on: string)
    {
        this.joins.push(
            new Join('RIGHT', table, on)
        );
        return this;
    }

    joinInner(table: IExpression | string, on: string)
    {
        return this.join(table, on);
    }

    joinOuter(table: IExpression | string, on: string)
    {
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

    groupBy(groups: string | string[]) {
        if (typeof groups === 'string') {
            this.groupBys.push(new Expression(groups));
            return this;
        }
        this.groupBys = this.groupBys.concat(
            groups.map(v => new Expression(v))
        );
        return this;
    }

    having(where: string | IExpression, params?: any) {
        this.havings.push(
            new Where(
                this.havings.length === 0 ? '' : 'AND',
                where,
                params
            )
        );
        return this;
    }

    orHaving(where: string | IExpression, params?: any) {
        this.havings.push(
            new Where(
                this.havings.length === 0 ? '' : 'OR',
                where,
                params
            )
        );
        return this;
    }

    orderBy(orders: string | string[]) {
        if (typeof orders === 'string') {
            this.orderBys.push(new Expression(orders));
            return this;
        }
        this.orderBys = this.orderBys.concat(
            orders.map(v => new Expression(v))
        );
        return this;
    }

    limit(limit: number, page?: number) {
        this._limit = limit;
        this._page = page;
        return this;
    }

    explain(_explain: boolean = true) {
        this._explain = _explain;
        return this;
    }

    distinct(_distinct: boolean = true) {
        this._distinct = _distinct;
        return this;
    }
}

function parseColumn(column: TColumn): Expression {
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

function parseTable(table: TTable): Expression {
    return parseColumn(table);
}

function isIExpression(val: any): val is IExpression {
    return (val.buildExpression && typeof val.buildExpression === 'function'
        && val.getQuery && typeof val.getQuery === 'function'
        && val.getParams && typeof val.getParams === 'function')
        || (val instanceof Expression);
}


const membersSelect = new Select();
membersSelect
    .select(['m.member_id'])
    .from({'m': 'members'})
    .where('m.member_id IN (?)', [1, 2, 3, 4])
    .where('m.active = ?', 1);

const query = new Select();
query
    .select([
        'u.*',
        {'org_unit': 'o.name'},
        {'org_unit_id': 'o.id'},
        {'org_level': "concat(o.scope, '-', o.level)"},
    ])
    .from({'u': 'users'})
    .join({'o': 'org_units'}, 'o.org_unit_id = u.org_unit_id')
    .where(new Where('', 'u.active = ?', 1, false))
    .where('u.date_joined >= ?', new Date(2021, 1, 1, 1, 1, 1))
    .orWhere('o.member_id in ({{?}})', membersSelect)
    .groupBy(['m.member_id'])
    .having('count(o.name) > ?', 1234);

console.log(query.buildExpression());

/**
 * [
 *   "SELECT u.*, o.name as org_unit, o.id as org_unit_id, concat(o.scope, '-', o.level) as org_level FROM users as u INNER JOIN org_units as o ON o.org_unit_id = u.org_unit_id WHERE (u.active = ?) AND (u.date_joined >= ?) OR (o.member_id in (SELECT m.member_id FROM members as m  WHERE (m.member_id IN (?)) AND (m.active = ?))) GROUP BY m.member_id HAVING (count(o.name) > ?)",
 *   [ 1, 2021-02-01T06:01:01.000Z, [ 1, 2, 3, 4 ], 1, 1234 ]
 * ]
 */
