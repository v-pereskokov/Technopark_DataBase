import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(user) {
    this.query = `INSERT INTO forums ("user", slug, title) 
    VALUES (
    (SELECT nickname FROM users WHERE LOWER(nickname) = LOWER('${user.user}')),
    '${user.slug}', 
    '${user.title}'
    );`;

    return this.dataBase.none(this.query);
  }

  get(slug) {
    this.query = `SELECT f.id, f.title, f."user", f.slug, f.posts, f.threads 
    FROM forums f 
    WHERE LOWER(f.slug) = LOWER('${slug}');`;

    return this.dataBase.one(this.query);
  }

  updateForums(slug) {
    this.query = `UPDATE forums SET threads = threads + 1 WHERE LOWER(slug) = LOWER('${slug}')`;

    return this.dataBase.none(this.query);
  }

  getSlug(slug) {
    this.query = `SELECT slug FROM forums WHERE LOWER(slug) = LOWER('${slug}');`;

    return this.dataBase.one(this.query);
  }

  getId(slug) {
    this.query = `SELECT id FROM forums WHERE LOWER(slug) = LOWER('${slug}');`;

    return this.dataBase.one(this.query);
  }

  update(user) {
    this.query = `UPDATE users SET (fullname, email, about)
     = ('${user.fullname}', '${user.email}', '${user.about}') 
    WHERE LOWER(nickname) = LOWER('${user.nickname}') RETURNING *;`;

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
}

const forumService = new ForumService();
export default forumService;
