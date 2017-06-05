import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  threadInsert(data) {
    this._query = `SELECT thread_insert(
    '${data.username}', 
    ${data.created ? `'${data.created}'` : 'current_timestamp'}, 
    '${data.forum}', 
    '${data.message}', 
    '${data.slug}', 
    '${data.title}'
    )`;

    console.log(this._query);

    return this._dataBase.oneOrNone(this._query);
  }

  getThreadBySlugOrId(slugOrId) {
    this._query = `SELECT u.nickname as author, t.created, f.slug AS forum, t.id, t.message, t.slug AS t_slug, t.title, t.votes 
    FROM threads t 
    JOIN users u ON (t.user_id = u.id) 
    JOIN forums f ON (t.forum_id = f.id) 
    WHERE ${+slugOrId ? `t.id = ${+slugOrId}` : `LOWER(t.slug) = LOWER(${slugOrId})`}`;

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
