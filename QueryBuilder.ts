import Select from "./Select";
import Insert from "./Insert";
import { SelectReturn, TColumn } from "./types";

export default class QueryBuilder {
  static select(columns: Array<TColumn> = ['*']): SelectReturn
  {
      const select = new Select();
      return select.select(columns);
  }

  static insert(table: string, columns: string[] = [])
  {
      const insert = new Insert();
      return insert.into(table, columns);
  }
}
