import {Fields, IQueryBuilder} from './types';
import Select from './Select';
import { STAR } from './constants';

export default class QueryBuilder implements IQueryBuilder {
  private _select?: Select;

  select(fields: Fields = STAR) {
    this._select = new Select();
    return this._select.select(fields);
  }

  build() {
    if (this._select) {
      return this._select.build();
    }
    return "";
  }

  toString() {
    return this.build();
  }
}
