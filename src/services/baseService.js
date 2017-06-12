import dataBase from '../config';

export default class BaseService {
  constructor() {
    this._query = '';
    this._dataBase = dataBase;
  }

  get task() {
    return this.dataBase.task;
  }

  get dataBase() {
    return this._dataBase;
  }

  get query() {
    return this._query;
  }

  set query(string) {
    this._query = string;
  }
}
