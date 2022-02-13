export interface IPredicate {
  build(): string;
}

export interface IPredicateParams {
  build(): {
    query: string;
    params: Array<any>;
    [key: string]: any;
  };
}

