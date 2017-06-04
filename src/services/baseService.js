import dataBase from '../config';

export default class BaseService {
  constructor() {
    this._query = '';
    this._dataBase = dataBase;
  }
}
