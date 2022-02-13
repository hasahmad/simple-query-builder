export default class InvalidTableNameError extends Error {
  constructor(value?: any) {
    super(`Invalid Table Name${value ? ', provided (' + value + ')' : ''}`);
  }
}
