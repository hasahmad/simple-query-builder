import { Field, From, Join, Where, Set } from "../statements";
import InvalidValueError from "../../exceptions/InvalidValueError";
import Query from "./BaseQuery";
import { TableName, Val } from "../types";

export default class Update extends Query {
  protected _sets: Array<Set>;

  constructor(
    table?: From | TableName,
    sets: Array<Set> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
    returning: Array<Field> = [],
  ) {
    super('UPDATE', [], [], wheres, joins, [], [], [], returning);
    if (table) {
      if (table instanceof From) {
        this._tables = [table];
      } else {
        this._tables = [new From(table)];
      }
    }

    this._sets = sets;
  }

  build() {
    const result = [
      "UPDATE",
      this._tables[0].build().query,
      "SET",
      this._sets.map(v => {
        const b = v.build();
        this._params.push(...b.params);
        return b.query;
      }).join(', '),
    ];
    this._params.push(...this._tables[0].build().params);

    if (this._joins.length) {
      result.push(
        this._joins.map(v => {
          const b = v.build();
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      )
    }
    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => {
          const b = v.build(i !== 0);
          this._params.push(...b.params);
          return b.query;
        }).join(' ')
      )
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
      params: this._params,
    };
  }

  from(table: From | TableName) {
    if (table instanceof From) {
      this._tables = [table];
      return this;
    }

    this.from(new From(table));
    return this;
  }

  set(set: Set | Array<Set> | {[key: string]: Val} | string, val?: Val, raw: boolean = false) {
    if (set instanceof Set) {
      this._sets.push(set);
      return this;
    }

    if (Array.isArray(set)) {
      for (const s of set) {
        this._sets.push(s);
      }
      return this;
    }

    if (typeof set === 'object') {
      for (const key of Object.keys(set)) {
        let k = key;
        if (key.endsWith('__raw')) {
          this._sets.push(new Set(k.replace('__raw', ''), set[k], true));
        } else {
          this._sets.push(new Set(k, set[k], raw));
        }
      }
      return this;
    }

    if (!val) { throw new InvalidValueError(); }

    this._sets.push(new Set(set, val, raw));
    return this;
  }
}
