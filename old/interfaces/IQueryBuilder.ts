export interface IQueryBuilder {
  build(): string;
}

export interface IQueryBuilderParams {
  build(): {
    query: string;
    params: Array<any>;
    [key: string]: any;
  };
}
