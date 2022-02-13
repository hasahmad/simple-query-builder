import Select from "./Select";
import { SelectReturn, TColumn } from "./types";

export default class QueryBuilder {
  static select(columns: Array<TColumn> = ['*']): SelectReturn
  {
      const select = new Select();
      return select.select(columns);
  }
}
