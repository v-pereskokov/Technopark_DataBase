const pgp = require('pg-promise')();

const connection = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'L13101997da'
};

const dataBase = pgp(connection);

module.exports.dataBase = dataBase;
