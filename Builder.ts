import { Fields } from './types';
import Select from './Select';
import { STAR } from './constants';

export default class QueryBuilder {
  static select(fields: Fields = STAR) {
    return new Select().select(fields);
  }
}
