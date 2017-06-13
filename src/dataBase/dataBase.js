const pgp = require('pg-promise');

export default class DataBase {
  constructor(options, connection) {
    this._pgp = pgp(options);
    this._dataBaseController = this.pgp(connection);
  }

  get controller() {
    return this._dataBaseController;
  }

  get pgp() {
    return this._pgp;
  }
}
