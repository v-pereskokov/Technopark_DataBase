import BaseService from './baseService';

class UserService extends BaseService {
  constructor() {
    super();
  }

  create(user) {
    this.query = `INSERT INTO users (nickname, email, fullname, about) 
    VALUES ('${user.nickname}', '${user.email}', '${user.fullname}', '${user.about}');`;

    return this.dataBase.none(this.query);
  }

  update(user) {
    this.query = `UPDATE users SET 
    fullname = COALESCE(${user.fullname ? `'${user.fullname}'` : 'NULL'}, fullname), 
    email = COALESCE(${user.email ? `'${user.email}'` : 'NULL'}, email),
    about = COALESCE(${user.about ? `'${user.about}'` : 'NULL'}, about) 
    WHERE LOWER(nickname) = LOWER('${user.nickname}')`;

    return this.dataBase.oneOrNone(this.query);
  }

  getUser(nickname, email) {
    this.query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER('${nickname}') OR 
    LOWER(email) = LOWER('${email}');`;

    return this.dataBase.many(this.query);
  }

  getUserByNickname(nickname) {
    this.query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER('${nickname}');`;

    return this.dataBase.one(this.query);
  }

  getUserByEmail(email) {
    this.query = `SELECT * FROM users WHERE LOWER(email) = LOWER('${email}');`;

    return this.dataBase.none(this.query);
  }

  getNickname(nickname) {
    this.query = `SELECT u.nickname FROM users u WHERE LOWER(nickname) = LOWER('${nickname}');`;

    return this.dataBase.one(this.query);
  }
}

const userService = new UserService();
export default userService;
