import { Col, TableName } from './types';
import Select from './Select';
import { STAR } from './constants';
import { Field, From } from './builder';
import Update from './Update';
import Delete from './Delete';

export default class QueryBuilder {
  static select(fields: Array<Field | Col> = [STAR]) {
    return new Select().select(fields);
  }

  static update(tables?: From | TableName) {
    if (!tables) {
      return new Update();
    }
    return new Update().from(tables);
  }

  static delete(tables?: From | TableName) {
    if (!tables) {
      return new Delete();
    }
    return new Delete().from(tables);
  }
}
