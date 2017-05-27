import dataBase from '../config';

class UserService {
  constructor() {
    this._query = '';
  }

  create(user) {
    this._query = `INSERT INTO users (nickname, email, fullname, about)
    VALUES (\'${user.nickname}\', \'${user.email}\', \'${user.fullname}\', \'${user.about}\');`;

    return dataBase.none(this._query);
  }

  update(user) {
    this._query = `UPDATE users SET (${user.names}) = (${user.values}) 
    WHERE LOWER(nickname) = LOWER(\'${user.nickname}\');`;

    return dataBase.none(this._query);
  }

  getUser(nickname, email) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${nickname}\') OR 
    LOWER(email) = LOWER(\'${email}\');`;

    return dataBase.many(this._query);
  }

  getUserByNickname(nickname) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${nickname}\');`;

    return dataBase.one(this._query);
  }

  getUserByEmail(email) {
    this._query = `SELECT * FROM users WHERE LOWER(email) = LOWER(\'${email}\');`;

    return dataBase.none(this._query);
  }
}

const userService = new UserService();
export default userService;
