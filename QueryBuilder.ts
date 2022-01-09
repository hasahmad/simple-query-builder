import { Col, TableName } from './types';
import Select from './Select';
import { STAR } from './constants';
import { Field, From } from './builder';
import Update from './Update';

export default class QueryBuilder {
  static select(fields: Array<Field | Col> = [STAR]) {
    return new Select().select(fields);
  }

  static update(tables?: From | TableName | Array<TableName>) {
    if (!tables) {
      return new Update();
    }
    return new Update().from(tables);
  }
}
