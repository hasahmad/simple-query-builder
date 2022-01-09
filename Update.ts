import { From, Join, Where } from "./builder";
import Set from "./builder/Set";
import InvalidValueError from "./exceptions/InvalidValueError";
import { IQueryBuilder, JoinOn, JoinType, OP, TableName, Val } from "./types";

export default class Update implements IQueryBuilder {
  private _from: From;
  private _sets: Array<Set>;
  private _wheres: Array<Where>;
  private _joins: Array<Join>;

  constructor(
    from?: From,
    sets: Array<Set> = [],
    wheres: Array<Where> = [],
    joins: Array<Join> = [],
  ) {
    if (!from) {
      this._from = new From([]);
    } else {
      this._from = from;
    }

    this._sets = sets;
    this._wheres = wheres;
    this._joins = joins;
  }

  build(): string {
    const result = [
      "UPDATE",
      this._from.build(),
      "SET",
      this._sets.map(v => v.build()).join(', '),
    ];
    if (this._joins.length) {
      result.push(
        this._joins.map(v => v.build()).join(' ')
      )
    }
    if (this._wheres.length) {
      result.push("WHERE");
      result.push(
        this._wheres.map((v, i) => v.build(i !== 0)).join(' ')
      )
    }

    return result.join(' ');
  }

  from(tables: From | TableName | Array<TableName>) {
    if (tables instanceof From) {
      this._from.addTables(tables.getTables());
      return this;
    }

    this._from.addTables(tables);
    return this;
  }

  set(set: Set | string, val: Val, raw: boolean = false) {
    if (set instanceof Set) {
      this._sets.push(set);
      return this;
    }

    this._sets.push(new Set(set, val, raw));
    return this;
  }

  join(join: Join | TableName, on?: JoinOn, type: JoinType = 'INNER') {
    if (join instanceof Join) {
      this._joins.push(join);
      return this;
    }
    if (!on) {
      throw new InvalidValueError();
    }

    this._joins.push(new Join(join, on, type));
    return this;
  }

  joinInner(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'INNER');
  }

  joinOuter(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'OUTER');
  }

  joinLeft(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'LEFT');
  }

  joinRight(table: Join | TableName, on?: JoinOn) {
    return this.join(table, on, 'RIGHT');
  }

  where(where: Where | string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    if (where instanceof Where) {
      this._wheres.push(where);
      return this;
    }

    this._wheres.push(new Where(where, op, val, 'AND', raw));
    return this;
  }

  orWhere(where: Where | string | IQueryBuilder, op: OP = "=", val?: Val, raw: boolean = false) {
    if (where instanceof Where) {
      this._wheres.push(where);
      return this;
    }

    this._wheres.push(new Where(where, op, val, 'OR', raw));
    return this;
  }
}
