import IsNull from "./IsNull";

export default class IsNotNull extends IsNull {
  protected predicate: string = "IS NOT";
}
