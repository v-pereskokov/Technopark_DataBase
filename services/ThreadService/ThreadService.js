const dataBase = require('../../database/DataBase');

class ThreadService {
  constructor() {
    this._query = '';
  }

  create(thread) {
    this._query = `INSERT INTO threads (author, forum, message, title, ${thread.created ? 'created, ' : ''}slug)
    VALUES (\'${thread.author}\', \'${thread.forum}\', \'${thread.message}\', \'${thread.title}\', ${thread.created ? `\'${thread.created}\',` : ''}\'${thread.slug}\');`;

    return dataBase.dataBase.none(this._query);
  }

  getThreadBySlug(slug, isResult = false) {
    this._query = `SELECT * FROM threads WHERE LOWER(slug) = LOWER(\'${slug}\');`;

    return isResult ? dataBase.dataBase.one(this._query) :
      dataBase.dataBase.none(this._query);
  }

  getThread(slug) {
    this._query = `SELECT T.id, T.created, T.author, T.message, T.slug, T.title, forums.slug as forum 
    FROM threads T INNER JOIN forums ON (forums.id = T.forum)
    WHERE LOWER(T.slug) = LOWER(\'${slug}\');`;

    return dataBase.dataBase.one(this._query);
  }

  getThreadByForumWithCondition(forum, condition) {
    this._query = `SELECT T.id, T.created, T.author, T.message, T.slug, T.title, F.slug as forum 
    FROM threads T INNER JOIN forums F ON (F.id = T.forum)
    WHERE T.forum = \'${forum}\'${condition};`;

    console.log(this._query);

    return dataBase.dataBase.any(this._query);
  }
}


const threadService = new ThreadService();

module.exports.threadService = threadService;
