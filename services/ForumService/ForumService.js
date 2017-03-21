const dataBase = require('../../database/DataBase');

class ForumService {
  constructor() {
    this._query = '';
  }

  createForum(forum) {
    this._query = `INSERT INTO forums (username, title, slug)
    VALUES (\'${forum.username}\', \'${forum.title}\', 
    \'${forum.slug}\');`;

    return dataBase.dataBase.none(this._query);
  }

  getForumByUsername(username, isReturn = false) {
    this._query = `SELECT * FROM forums 
    WHERE LOWER(username) = LOWER(\'${username}\');`;

    return isReturn ? dataBase.dataBase.one(this._query) :
      dataBase.dataBase.none(this._query);
  }

  getForumBySlugNotAll(fields, slug) {
    this._query = `SELECT ${fields} FROM forums 
    WHERE LOWER(slug) = LOWER(\'${slug}\');`;

    return dataBase.dataBase.one(this._query);
  }
}

const forumService = new ForumService();

module.exports.forumService = forumService;
