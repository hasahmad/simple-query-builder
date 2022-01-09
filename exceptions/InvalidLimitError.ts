export default class InvalidLimitError extends Error {
  constructor(value?: any) {
    super(`Invalid limit. Must be a number${value ? ', provided (' + value + ')' : ''}`);
  }
}
