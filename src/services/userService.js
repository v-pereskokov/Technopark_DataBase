import BaseService from './baseService';

class UserService extends BaseService {
  constructor() {
    super();
  }

  create(user, context = this.dataBase) {
    this.query = `INSERT INTO users (nickname, email, fullname, about) 
    VALUES ('${user.nickname}', '${user.email}', '${user.fullname}', '${user.about}')`;

    return context.none(this.query);
  }

  update(user, context = this.dataBase) {
    this.query = `UPDATE users SET 
    fullname = COALESCE(${user.fullname ? `'${user.fullname}'` : 'NULL'}, fullname), 
    email = COALESCE(${user.email ? `'${user.email}'` : 'NULL'}, email),
    about = COALESCE(${user.about ? `'${user.about}'` : 'NULL'}, about) 
    WHERE LOWER(nickname) = LOWER('${user.nickname}') 
    RETURNING *`;

    return context.oneOrNone(this.query);
  }

  getUser(nickname, email, context = this.dataBase) {
    this.query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER('${nickname}') OR 
    LOWER(email) = LOWER('${email}');`;

    return context.many(this.query);
  }

  getUserByNickname(nickname) {
    this.query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER('${nickname}');`;

    return this.dataBase.oneOrNone(this.query);
  }

  getUserByEmail(email) {
    this.query = `SELECT * FROM users WHERE LOWER(email) = LOWER('${email}');`;

    return this.dataBase.none(this.query);
  }

  getNickname(nickname) {
    this.query = `SELECT u.nickname FROM users u WHERE LOWER(nickname) = LOWER('${nickname}');`;

    return this.dataBase.one(this.query);
  }

  getForumMembers(data) {
    this.query = `SELECT u.id, u.nickname, u.email, u.fullname, u.about 
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
    this.query = `SELECT 
      CASE WHEN (
        SELECT id FROM users 
        WHERE nickname <> '${nickname}' and email='${email}'
      ) IS NOT NULL THEN TRUE ELSE FALSE END AS "conflict", 
      CASE WHEN (
        SELECT id FROM users 
        WHERE nickname='${nickname}'
      ) IS NOT NULL THEN FALSE ELSE TRUE END AS "notfound"`;

    console.log(this.query);

    return context.one(this.query);
  }
}

const userService = new UserService();
export default userService;
