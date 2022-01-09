import Like from "./Like";

export default class NotLike extends Like {
  protected predicate: string = "NOT LIKE";
}
