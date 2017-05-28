import dataBase from '../config';
// const a = "INSERT INTO forums (slug, title, "user") VALUES " +
// "(?, ?, (SELECT nickname FROM users WHERE lower(nickname) = lower(?)))";
class ForumService {
  constructor() {
    this._query = '';
  }

  create(user) {
    this._query = `INSERT INTO forums (slug, title, \"user\") VALUES (\'${user.slug}\', \'${user.title}\', (SELECT nickname FROM users WHERE lower(nickname) = lower(\'${user.user}\')));`;

    return dataBase.none(this._query);
  }

  get(slug) {
    this._query = `SELECT f.id, f.title, f.\"user\", f.slug, f.posts, f.threads 
    FROM forums f 
    WHERE lower(f.slug) = lower('${slug}');`;

    return dataBase.oneOrNone(this._query);
  }

  getSlug(slug) {
    this._query = `SELECT slug FROM forums WHERE lower(slug) = lower(\'${slug}\');`;

    return dataBase.one(this._query);
  }

  getId(slug) {
    this._query = `SELECT id FROM forums WHERE lower(slug) = lower(\'${slug}\');`;

    return dataBase.one(this._query);
  }

  update(user) {
    this._query = `UPDATE users SET (fullname, email, about)
     = ('${user.fullname}', '${user.email}', '${user.about}') 
    WHERE LOWER(nickname) = LOWER(\'${user.nickname}\') RETURNING *;`;

    console.log(this._query);

    return dataBase.oneOrNone(this._query);
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

const forumService = new ForumService();
export default forumService;
