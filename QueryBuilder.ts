import { Col, TableName } from './types';
import Select from './Select';
import { STAR } from './constants';
import { Field, From } from './builder';
import Update from './Update';
import Delete from './Delete';
import Insert from './Insert';

export default class QueryBuilder {
  static select(fields: Array<Field | Col> = [STAR]) {
    return new Select().select(fields);
  }

  static insert(table?: From | TableName) {
    if (!table) {
      return new Insert();
    }
    return new Insert().into(table);
  }

  static update(table?: From | TableName) {
    if (!table) {
      return new Update();
    }
    return new Update().from(table);
  }

  static delete(table?: From | TableName) {
    if (!table) {
      return new Delete();
    }
    return new Delete().from(table);
  }
}
