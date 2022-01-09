import { Col } from './types';
import Select from './Select';
import { STAR } from './constants';
import { Field } from './builder';

export default class QueryBuilder {
  static select(fields: Array<Field | Col> = [STAR]) {
    return new Select().select(fields);
  }
}
