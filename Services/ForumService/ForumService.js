const dataBase = require('../../database/DataBase');

class ForumService {
  constructor() {
    this._query = '';
  }

  createForum(forum) {
    this._query = `INSERT INTO forums (slug, title, username) ` +
      `VALUES(\'${forum.slug}\', \'${forum.title}\', \'${forum.username}\');`;

    return dataBase.dataBase.oneOrNone(this._query);
  }

  createThread(thread) {
    if (!thread.created) {
      thread.created = new Date().toString();
    }

    this._query = `INSERT INTO threads (author, created, forum, \"message\", slug, title) ` +
      `VALUES(${thread.author}, ${thread.created}, ` +
      `(SELECT slug FROM forum WHERE LOWER(slug) = LOWER(${thread.forum})), ` +
      `${thread.message}, ${thread.slug}, ${thread.title});`;

    return dataBase.dataBase.query(this._query)
      .then(() => {
        this._query = `UPDATE forums SET threads = threads + 1 WHERE LOWER(slug) = LOWER(${thread.forum});`;

        dataBase.dataBase.query(this._query)
          .then(() => {
            this._query = `SELECT * FROM threads WHERE LOWER(slug) = LOWER(${thread.slug});`;
            dataBase.dataBase.query(this._query);
          });
      });
  }

  getForumBySlug(slug) {
    this._query = `SELECT * FROM forums WHERE LOWER(slug) = LOWER(\'${slug}\');`;

    return dataBase.dataBase.oneOrNone(this._query);
  }

  getForumByUsername(username) {
    this._query = `SELECT * FROM forums WHERE LOWER(username) = LOWER(\'${username}\');`;

    return dataBase.dataBase.one(this._query);
  }

  getThread(slug) {
    this._query = `SELECT * FROM threads WHERE LOWER(slug) = LOWER(\'${slug}\');`;

    return dataBase.dataBase.oneOrNone(this._query);
  }

  getThreads(slug, limit, since, desc = false) {
    this._query = `SELECT * FROM threads WHERE LOWER(forum) = LOWER(${slug})`;

    if (since) {
      this._query += ' AND created ';
      this._query += desc ? '<= ' : ' >= ';
      this._query += `${since}`;
    }

    this._query += ' ORDER BY created ';

    if (desc) {
      this._query += 'DESC ';
    }

    this._query += `LIMIT ${limit};`;

    return dataBase.dataBase.oneOrNone(this._query);
  }

  getUsers(slug, limit, since, desc = false) {
    this._query = `SELECT * FROM users WHERE LOWER(users.nickname) IN ` +
      `(SELECT LOWER(posts.author) FROM posts WHERE LOWER(posts.forum) = LOWER(${slug}) ` +
      `UNION ` +
      `SELECT LOWER(threads.author) FROM threads WHERE LOWER(threads.forum) = LOWER(${slug}))`;

    if (since) {
      this._query += ' AND LOWER(users.nickname) ';
      this._query += desc ? '< ' : '> ';
      this._query += `LOWER(${since})`;
    }

    this._query += ` ORDER BY LOWER(users.nickname) COLLATE ucs_basic`;

    if (desc) {
      this._query += ' DESC';
    }

    this._query += `LIMIT ${limit};`;

    return dataBase.dataBase.oneOrNone(this._query);
  }
}

const forumService = new ForumService();

module.exports.forumService = forumService;
