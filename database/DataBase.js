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
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'L13101997da'
});

module.exports.dataBase = dataBase.getController();
