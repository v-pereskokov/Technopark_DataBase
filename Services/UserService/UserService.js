const dataBase = require('../../database/DataBase');

class UserService {
  constructor() {
    this._query = '';
  }

  createTable() {
    this._query = "CREATE TABLE IF NOT EXISTS users (" +
      "id SERIAL NOT NULL PRIMARY KEY," +
      "about TEXT," +
      "nickname VARCHAR(15) NOT NULL UNIQUE," +
      "fullname VARCHAR(30)," +
      "email VARCHAR(30) NOT NULL UNIQUE)";

    return dataBase.dataBase.query(this._query);
  }

  create(user) {
    this._query = 'INSERT INTO users (about, nickname, fullname, email) ' +
      'VALUES (${about}, ${nickname}, ${fullname}, ${email})';

    return dataBase.dataBase.query(this._query, user);
  }

  update(user) {
    this._query = `UPDATE users SET (${user.names}) = (${user.values}) WHERE LOWER(nickname) = LOWER(\'${user.nickname}\');`;

    return dataBase.dataBase.none(this._query);
  }

  getUserByNickname(field) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${field}\');`;

    return dataBase.dataBase.one(this._query);
  }

  getUserByEmail(field) {
    this._query = `SELECT * FROM users WHERE LOWER(email) = LOWER(\'${field}\');`;

    return dataBase.dataBase.none(this._query);
  }

  getUser(nickname, email) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${nickname}\') OR LOWER(email) = LOWER(\'${email}\');`;

    return dataBase.dataBase.many(this._query);
  }

  getAllUsers() {
    this._query = 'SELECT * FROM users;';

    return dataBase.dataBase.manyOrNone(this._query);
  }

  _isEmpty(field) {
    return field.trim().length === 0;
  }
}

const userService = new UserService();

module.exports.userService = userService;
