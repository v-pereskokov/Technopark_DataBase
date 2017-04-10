const pgp = require('pg-promise')();

class DataBase {
  constructor(connection) {
    this._dataBaseController = pgp(connection);
  }

  getController() {
    return this._dataBaseController;
  }
}

const dataBase = new DataBase({
  user: 'docker',
  database: 'docker',
  password: 'docker',
  host: 'localhost',
  port: 5432
});

module.exports.dataBase = dataBase.getController();

