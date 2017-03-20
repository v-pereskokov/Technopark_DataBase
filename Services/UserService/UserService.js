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
    this._query = 'UPDATE users SET';

    //to do

    this._query = `UPDATE users SET (about, fullname, email) = (\'${user.about}\', \'${user.fullname}\', \'${user.email}\') WHERE LOWER(nickname) = LOWER(\'${user.nickname}\');`;

    return dataBase.dataBase.query(this._query);
  }

  getUserByNickname(field) {
    this._query = 'SELECT * FROM users WHERE LOWER(nickname) = LOWER(${nickname});';

    return dataBase.dataBase.oneOrNone(this._query, {
      nickname: field
    });
  }

  getUserByEmail(field) {
    this._query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(${email});';

    return dataBase.dataBase.oneOrNone(this._query, {
      email: field
    });
  }

  getUser(nickname, email) {
    this._query = 'SELECT * FROM users WHERE LOWER(nickname) = LOWER(${nickname}) OR LOWER(email) = LOWER(${email});';

    return dataBase.dataBase.manyOrNone(this._query, {
      nickname: nickname,
      email: email
    });
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
