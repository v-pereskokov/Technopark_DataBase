import BaseService from './baseService';

class UserService extends BaseService {
  constructor() {
    super();
  }

  create(nickname, user) {
    return this.dataBase.one(`INSERT INTO users (nickname, email, fullname, about) 
    VALUES ('${nickname}', '${user.email}', '${user.fullname}', '${user.about}') 
    RETURNING *`);
  }

  update(user, context = this.dataBase) {
    return context.oneOrNone(`UPDATE users SET 
    fullname = COALESCE(${user.fullname ? `'${user.fullname}'` : 'NULL'}, fullname), 
    email = COALESCE(${user.email ? `'${user.email}'` : 'NULL'}, email),
    about = COALESCE(${user.about ? `'${user.about}'` : 'NULL'}, about) 
    WHERE LOWER(nickname) = LOWER('${user.nickname}') 
    RETURNING *`);
  }

  getUser(nickname, email, context = this.dataBase) {
    return context.manyOrNone(`SELECT * FROM users WHERE LOWER(nickname) = LOWER('${nickname}') OR 
    LOWER(email) = LOWER('${email}')`);
  }

  getUserNickname(nickname, context = this.dataBase) {
    return context.oneOrNone(`SELECT nickname FROM users WHERE UPPER(nickname) = UPPER('${nickname}')`);
  }

  getUserByNickname(nickname) {
    return this.dataBase.oneOrNone(`SELECT * 
     FROM users WHERE LOWER(nickname) = LOWER('${nickname}')`);
  }

  getUserByNicknameNL(nickname, context = this.dataBase) {
    return context.oneOrNone(`SELECT * 
     FROM users WHERE nickname = '${nickname}'`);
  }

  getForumMembers(data) {
    this.query = `SELECT u.id::int, u.nickname, u.email, u.fullname, u.about 
    FROM users u 
    WHERE u.id IN (
    SELECT fm.userId 
    FROM forumMembers fm 
    WHERE fm.forumId = ${data.id})`;

    if (data.since) {
      this.query += ` AND lower(u.nickname) ${data.desc === 'true' ? '<' : '>'} 
      LOWER('${data.since}')`;
    }

    this.query += ` ORDER BY LOWER(u.nickname) ${data.desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${data.limit}`;

    return this.dataBase.manyOrNone(this.query);
  }

  checkErrors(nickname, email, context = this.dataBase) {
    return context.one(`SELECT 
      CASE WHEN (
        SELECT nickname FROM users 
        WHERE LOWER(nickname) <> LOWER('${nickname}') AND LOWER(email) = LOWER('${email}')
      ) IS NOT NULL THEN TRUE ELSE FALSE END AS "conflict", 
      CASE WHEN (
        SELECT nickname FROM users 
        WHERE LOWER(nickname) = LOWER('${nickname}')) IS NOT NULL THEN FALSE ELSE TRUE END AS "notfound"`);
  }
}

const userService = new UserService();
export default userService;
