const pgp = require('pg-promise')();

const connection = {
  host: 'localhost',
  port: 5432,
  database: 'docker',
  user: 'docker',
  password: 'docker'
};

const dataBase = pgp(connection);

module.exports.dataBase = dataBase;
