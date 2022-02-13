import { IExpression } from "./types";

export default class Expression implements IExpression {
  query!: string;
  params: any[] = [];

  constructor(query: IExpression | string, params: any[] = []) {
    this.setQuery(query);
    this.setParams(params);
  }

  setQuery(query: IExpression | string) {
    if (typeof query === 'string') {
      this.query = query;
    } else {
      const [qry, params] = query.buildExpression();
      this.query = qry;
      this.params = this.params.concat(params);
    }

    return this;
  }

  setParams(params?: any[]) {
    if (typeof params === 'undefined') {
      return;
    }

    this.params = this.params.concat(params);
    return this;
  }

  getParams(): any[] {
    return this.params;
  }

  getQuery(): string {
    return this.query;
  }

  buildExpression(): [string, Array<any>] {
    return [this.getQuery(), this.getParams()];
  }
}
