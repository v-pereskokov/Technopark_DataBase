const pgp = require('pg-promise')();

const connection = {
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'lalala'
};

const dataBase = pgp(connection);

module.exports.dataBase = dataBase;
