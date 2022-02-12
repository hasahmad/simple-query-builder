
interface IBuildExpression {
    buildExpression(): [string, Array<any>];
}

interface IExpression extends IBuildExpression {
    getParams(): any[];
    getQuery(): string;
}

type TColumn = IExpression | string | { [key: string]: IExpression | string };
type TTable = IExpression | string | { [key: string]: IExpression | string };

type SelectReturn = IExpression & IExplain & IDistinct & IFrom;
type ExplainReturn = IExpression & IDistinct & IFrom;
type DistinctReturn = IExpression & IFrom;
type FromReturn = IExpression & IJoin & IWhere;
type JoinReturn = IExpression & IJoin & IWhere;
type WhereReturn = IExpression & IWhere & IGroupBy & IOrderBy & ILimit;
type GroupByReturn = IExpression & IHaving & IOrderBy & ILimit;
type HavingReturn = IExpression & IHaving & IOrderBy & ILimit;
type OrderByReturn = IExpression & ILimit;
type LimitReturn = IExpression;

interface ISelect {
    select(columns?: Array<TColumn>): SelectReturn;
};

interface IExplain {
    explain(_explain?: boolean): ExplainReturn;
}

interface IDistinct {
    distinct(_distinct?: boolean): DistinctReturn;
}

interface IFrom {
    from(tables: TTable | Array<TTable>): FromReturn;
};

interface IJoin {
    join(table: TTable, on: string): JoinReturn;
    joinLeft(table: TTable, on: string): JoinReturn;
    joinRight(table: TTable, on: string): JoinReturn;
    joinInner(table: TTable, on: string): JoinReturn;
    joinOuter(table: TTable, on: string): JoinReturn;
};

interface IWhere {
    where(where: string | IExpression, params?: any): WhereReturn;
    orWhere(where: string | IExpression, params?: any): WhereReturn;
}

interface IGroupBy {
    groupBy(groups: string | string[]): GroupByReturn;
}

interface IHaving {
    having(where: string | IExpression, params?: any): HavingReturn;
    orHaving(where: string | IExpression, params?: any): HavingReturn;
}

interface IOrderBy {
    orderBy(orders: string | string[]): OrderByReturn;
}

interface ILimit {
    limit(limit: number, page?: number): LimitReturn;
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

class Select implements
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
    ILimit
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

    getParams(): any[]
    {
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

    getQuery(): string
    {
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

    buildExpression(): [string, Array<any>]
    {
        return [this.getQuery(), this.getParams()];
    }

    select(columns: Array<TColumn> = ['*']): SelectReturn
    {
        columns.forEach(v => {
            this.columns.push(parseColumn(v));
        });
        return this;
    }

    from(tables: TTable | Array<TTable>): FromReturn
    {
        if (Array.isArray(tables)) {
            tables.forEach(v => {
                this.fromTables.push(parseTable(v));
            });
        } else {
            this.fromTables.push(parseTable(tables));
        }

        return this;
    }

    join(table: TTable, on: string): JoinReturn
    {
        this.joins.push(
            new Join('INNER', table, on)
        );
        return this;
    }

    joinLeft(table: TTable, on: string): JoinReturn
    {
        this.joins.push(
            new Join('LEFT', table, on)
        );
        return this;
    }

    joinRight(table: TTable, on: string): JoinReturn
    {
        this.joins.push(
            new Join('RIGHT', table, on)
        );
        return this;
    }

    joinInner(table: TTable, on: string): JoinReturn
    {
        return this.join(table, on);
    }

    joinOuter(table: TTable, on: string): JoinReturn
    {
        this.joins.push(
            new Join('OUTER', table, on)
        );
        return this;
    }

    where(where: string | IExpression, params?: any): WhereReturn
    {
        this.wheres.push(
            new Where(
                this.wheres.length === 0 ? '' : 'AND',
                where,
                params
            )
        );
        return this;
    }

    orWhere(where: string | IExpression, params?: any): WhereReturn
    {
        this.wheres.push(
            new Where(
                this.wheres.length === 0 ? '' : 'OR',
                where,
                params
            )
        );
        return this;
    }

    groupBy(groups: string | string[]): GroupByReturn
    {
        if (typeof groups === 'string') {
            this.groupBys.push(new Expression(groups));
        } else {
            this.groupBys = this.groupBys.concat(
                groups.map(v => new Expression(v))
            );
        }
        return this;
    }

    having(where: string | IExpression, params?: any): HavingReturn
    {
        this.havings.push(
            new Where(
                this.havings.length === 0 ? '' : 'AND',
                where,
                params
            )
        );
        return this;
    }

    orHaving(where: string | IExpression, params?: any): HavingReturn
    {
        this.havings.push(
            new Where(
                this.havings.length === 0 ? '' : 'OR',
                where,
                params
            )
        );
        return this;
    }

    orderBy(orders: string | string[]): OrderByReturn
    {
        if (typeof orders === 'string') {
            this.orderBys.push(new Expression(orders));
        } else {
            this.orderBys = this.orderBys.concat(
                orders.map(v => new Expression(v))
            );
        }
        return this;
    }

    limit(limit: number, page?: number): LimitReturn
    {
        this._limit = limit;
        this._page = page;
        return this;
    }

    explain(_explain: boolean = true): ExplainReturn
    {
        this._explain = _explain;
        return this;
    }

    distinct(_distinct: boolean = true): DistinctReturn
    {
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

function isIExpression(val: unknown): val is IExpression {
    if (typeof val !== 'object') { return false; }

    return val instanceof Expression
        || (
            typeof (val as IExpression).buildExpression === 'function'
            && typeof (val as IExpression).getQuery === 'function'
            && typeof (val as IExpression).getParams === 'function'
        );
}

type TValue = string
    | number
    | boolean
    | { value: any, raw?: boolean, type?: string }
    | null
    | Array<TValue | { value: any, raw?: boolean, type?: string }>

function parseValue(value: any, raw: boolean = false, type: string | null = null): string {
    if (raw) {
        return `${value}`;
    }

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

    if (isString) {
        return `'${value}'`;
    }

    if (isBool) {
        return `${value}`;
    }

    if (isArray) {
        return (value as TValue[]).map((v: TValue) => {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                return parseValue(v.value || v, v.raw || false, v.type);
            }

            return parseValue(v);
        }).join(',');
    }

    return `${value}`;
}

class QueryBuilder {
    static select(columns: Array<TColumn> = ['*']): SelectReturn
    {
        const select = new Select();
        return select.select(columns);
    }
}


const membersSelect = QueryBuilder
    .select(['m.member_id'])
    .from({'m': 'members'})
    .where('m.member_id IN (?)', [1, 2, 3, 4])
    .where('m.active = ?', 1);

const query = QueryBuilder
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


console.log(
    QueryBuilder.select([
        'u.*',
        {'org_unit': 'o.name'},
        {'org_unit_id': 'o.id'},
        {'org_level': "concat(o.scope, '-', o.level)"},
    ]).explain(true).distinct(true).buildExpression()
);
/**
 * [
 *   "EXPLAIN DISTINCT SELECT u.*, o.name as org_unit, o.id as org_unit_id, concat(o.scope, '-', o.level) as org_level",
 *   []
 * ]
 */

console.log({
    1: parseValue(1),
    '2': parseValue('2'),
    'str': parseValue('str'),
    '[1,2,3,]': parseValue([1,2,3,]),
    '["he","ll","o",100,238]': parseValue(["he","ll","o",100,238]),
    '["he","ll","o",{value: 100, type: "string"},238]': parseValue(["he","ll","o",{value: 100, type: "string"},238]),
    'string with type array': parseValue('[1,2,3,]', false, 'array'),
})
/**
 * {
 *  '1': '1',
 *  '2': "'2'",
 *  str: "'str'",
 *  '[1,2,3,]': '1,2,3',
 *  '["he","ll","o",100,238]': "'he','ll','o',100,238",
 *  '["he","ll","o",{value: 100, type: "string"},238]': "'he','ll','o','100',238",
 *  'string with type array': '[1,2,3,]'
 * }
 */

