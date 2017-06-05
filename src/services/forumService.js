import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(user) {
    this._query = `INSERT INTO forums ("user", slug, title) 
    VALUES (
    (SELECT nickname FROM users WHERE lower(nickname) = lower('${user.user}')),
    '${user.slug}', 
    '${user.title}'
    );`;

    return this._dataBase.none(this._query);
  }

  get(slug) {
    this._query = `SELECT f.id, f.title, f."user", f.slug, f.posts, f.threads 
    FROM forums f 
    WHERE lower(f.slug) = lower('${slug}');`;

    return this._dataBase.one(this._query);
  }

  updateForums(slug) {
    this._query = `UPDATE forums SET threads = threads + 1 WHERE lower(slug) = lower('${slug}')`;

    return this._dataBase.none(this._query);
  }

  getSlug(slug) {
    this._query = `SELECT slug FROM forums WHERE lower(slug) = lower(\'${slug}\');`;

    return this._dataBase.one(this._query);
  }

  getId(slug) {
    this._query = `SELECT id FROM forums WHERE lower(slug) = lower(\'${slug}\');`;

    return this._dataBase.one(this._query);
  }

  update(user) {
    this._query = `UPDATE users SET (fullname, email, about)
     = ('${user.fullname}', '${user.email}', '${user.about}') 
    WHERE LOWER(nickname) = LOWER(\'${user.nickname}\') RETURNING *;`;

    console.log(this._query);

    return this._dataBase.oneOrNone(this._query);
  }

  getUser(nickname, email) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${nickname}\') OR 
    LOWER(email) = LOWER(\'${email}\');`;

    return this._dataBase.many(this._query);
  }

  getUserByNickname(nickname) {
    this._query = `SELECT * FROM users WHERE LOWER(nickname) = LOWER(\'${nickname}\');`;

    return this._dataBase.one(this._query);
  }

  getUserByEmail(email) {
    this._query = `SELECT * FROM users WHERE LOWER(email) = LOWER(\'${email}\');`;

    return this._dataBase.none(this._query);
  }
}

const forumService = new ForumService();
export default forumService;
