import { Field, From, Join, Where } from "../statements";
import Query from "./BaseQuery";
import { IQueryBuilderParams, TableName } from "../types";

export type IData = Array<Array<any> | any> | IQueryBuilderParams;

export default class Insert extends Query {
  protected _data: IData;

  constructor(
    table?: From | TableName,
    data: IData = [],
    fields: Array<Field> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    returning: Array<Field> = [],
  ) {
    super('INSERT', [], fields, wheres, joins, [], [], [], returning);
    if (table) {
      if (table instanceof From) {
        this._tables = [table];
      } else {
        this._tables = [new From(table)];
      }
    }

    this._data = data;
  }

  build() {
    const result = [
      "INSERT INTO",
      this._tables[0].build().query,
      this._fields.length > 0 ? `(${this._fields.map(v => {
        const b = v.build();
        this._params.push(...b.params);
        return b.query;
      }).join(', ')})` : '',
      "VALUES",
    ].filter(v => v.trim());
    this._params.push(...this._tables[0].build().params);

    if (Array.isArray(this._data)) {
      this._params.push(this._data);
      result.push('?');
    } else {
      const b = this._data.build();
      this._params.push(...b.params);
      result.push(`(${b.query})`);
    }

    if (this._joins.length) {
      result.push(
        this._joins.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      );
    }

    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => {
          const b = v.build(i !== 0);
          this._params.push(b.params);
          return b.query;
        }).join(' ')
      );
    }

    if (this._returning.length) {
      result.push("RETURNING");
      result.push(
        this._returning.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(', ')
      );
    }

    return {
      query: result.join(' '),
      params: this._params
    };
  }

  into(table: From | TableName) {
    return this.table(table);
  }

  data(data: Array<{[key: string]: any} | Array<any>> | IQueryBuilderParams) {
    if (!Array.isArray(data)) {
      this._data = data;
      return this;
    }

    if (typeof data[0] === 'object' &&
      !Array.isArray(data[0]) &&
      !this._fields.length
    ) {
      this._fields = Object.keys(data[0]).map(v => new Field(v));
    }

    this._data = data.map(d => {
      if (typeof d === 'object' && !Array.isArray(d)) {
        return this._fields.map(f => {
          const b = f.build();
          this._params.push(...b.params);
          return d[f.build().query];
        });
      }

      return d;
    });
    return this;
  }

  fields(fields: Array<string>) {
    this._fields = fields.map(v => new Field(v));
    return this;
  }
}
