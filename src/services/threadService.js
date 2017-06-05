import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  create(data) {
    this._query = `INSERT INTO threads (author, created, forum, message, slug, title) 
    VALUES ((SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower('${data.username}')), 
    ${data.created ? `'${data.created}'::TIMESTAMPTZ` : 'current_timestamp'},
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), 
    '${data.message}', '${data.slug}', 
    '${data.title}') 
    RETURNING *`;

    console.log(this._query);
    return this._dataBase.one(this._query);
  }

  getBySlug(slug) {
    this._query = `SELECT t.id, t.author, t.forum, 
    t.slug, t.created, t.message, t.title, t.votes FROM 
    threads t 
    WHERE lower(t.slug) = lower('${slug}')`;

    return this._dataBase.one(this._query);
  }

  getForumThreads(slug, limit, since, desc) {
    this._query = `SELECT t.id, t.slug, t.author, 
    t.forum, t.created, t.message, t.title, t.votes 
    FROM 
    threads t 
    WHERE lower(t.forum) = lower('${slug}') `;

    if (since) {
      this._query += 'AND t.created';
      this._query += desc ? ` <= ` :
        ` >= `;
      this._query += `'${since}'::TIMESTAMPTZ `;
    }

    this._query += `ORDER BY t.created ${desc ? 'DESC' : 'ASC '} LIMIT ${limit}`;

    return this._dataBase.many(this._query);
  }
}

const threadService = new ThreadService();
export default threadService;
