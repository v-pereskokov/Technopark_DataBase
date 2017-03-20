const dataBase = require('../../database/DataBase');

class UserService {
  constructor() {
    this._query = '';
  }

  createTable() {
    this._query = "CREATE TABLE IF NOT EXISTS \"user\" (" +
      "id SERIAL NOT NULL PRIMARY KEY," +
      "about TEXT," +
      "nickname VARCHAR(15) NOT NULL UNIQUE," +
      "fullname VARCHAR(30)," +
      "email VARCHAR(30) NOT NULL UNIQUE)";

    return dataBase.dataBase.query(this._query);
  }

  create(user) {
    this._query = 'INSERT INTO \"user\" (about, nickname, fullname, email) ' +
      'VALUES (${about}, ${nickname}, ${fullname}, ${email})';

    return dataBase.dataBase.query(this._query, user);
  }

  update(user) {
    this._query = 'UPDATE user SET ';

    if (user.about) {
      this._query += `about = \'${user.about}\', `;
    }

    if (user.nickname) {
      this._query += `nickname = \'${user.nickname}\', `;
    }

    if (user.fullname) {
      this._query += `fullname = \'${user.fullname}\', `;
    }

    if (user.email) {
      this._query += `email = \'${user.email}\',`;
    }

    console.log(this._query.slice(0, this._query.length - 1));

    this._query += ';';

    return dataBase.dataBase.query(this._query.slice(0, this._query.length - 1));
  }

  getUserByNickname(field) {
    this._query = 'SELECT * FROM \"user\" WHERE LOWER(nickname) = LOWER(${nickname});';

    return dataBase.dataBase.oneOrNone(this._query, {
      nickname: field
    });
  }

  getUserByEmail(field) {
    this._query = 'SELECT * FROM \"user\" WHERE LOWER(email) = LOWER(${email});';

    return dataBase.dataBase.oneOrNone(this._query, {
      email: field
    });
  }

  getAllUsers() {
    this._query = 'SELECT * FROM \"user\";';

    return dataBase.dataBase.manyOrNone(this._query);
  }
}

const userService = new UserService();

module.exports.userService = userService;
