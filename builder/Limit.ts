import InvalidLimitError from "../exceptions/InvalidLimitError";
import { IQueryBuilder } from "../types";

export default class Limit implements IQueryBuilder {
  private _limit?: number;
  private _offset: number = 0;

  constructor(limit?: number, offset: number = 0) {
    this._limit = limit;
    this._offset = offset;
  }

  public build() {
    return this.parseLimit();
  }

  private parseLimit() {
    if (typeof this._limit !== 'number') {
      throw new InvalidLimitError();
    }

    if (typeof this._offset === 'undefined' || isNaN(this._offset)) {
      return `${this._limit}`;
    }

    return `${this._offset} ${this._limit}`;
  }
}
