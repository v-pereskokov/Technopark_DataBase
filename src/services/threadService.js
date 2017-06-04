import dataBase from '../config';

class ThreadService {
  constructor() {
    this._query = '';
  }

  create(data) {
    this._query = `INSERT INTO threads (author, created, forum, message, slug, title) 
    VALUES ((SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower('${data.username}')), 
    COALESCE('${data.created}'::TIMESTAMPTZ, current_timestamp), 
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), '${data.slug}', '${data.message}', '${data.title}') RETURNING *`;

    console.log(this._query);
    return dataBase.many(this._query);
  }


}

const threadService = new ThreadService();
export default threadService;
