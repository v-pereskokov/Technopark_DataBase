import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  // optimize created?
  create(data) {
    this.query = `INSERT INTO threads (author, created, forum, message, slug, title) 
    VALUES ((SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower('${data.username}')), 
    ${data.created ? `'${data.created}'::TIMESTAMPTZ` : 'current_timestamp'},
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), 
    '${data.message}', '${data.slug}', 
    '${data.title}') 
    RETURNING *`;

    return this.dataBase.oneOrNone(this.query);
  }

  findThreadById(id) {
    this.query = `SELECT t.id, t.slug, t.author, t.created, t.forum, t.message, t.title, t.votes 
    FROM 
    threads t 
    WHERE t.id = ${id}`;

    return this.dataBase.oneOrNone(this.query);
  }

  findThreadBySlug(slug) {
    this.query = `SELECT t.id, t.author, t.forum, 
    t.slug, t.created, t.message, t.title, t.votes 
    FROM 
    threads t 
    WHERE LOWER(t.slug) = LOWER('${slug}')`;

    return this.dataBase.oneOrNone(this.query);
  }

  getForumThreads(slug, limit, since, desc) {
    this.query = `SELECT t.id, t.slug, t.author,
    t.forum, t.created, t.message, t.title, t.votes
    FROM
    threads t
    WHERE LOWER(t.forum) = LOWER('${slug}') `;

    if (since) {
      this.query += 'AND t.created';
      this.query += desc === 'true' ? ` <= ` : ` >= `;
      this.query += `'${since}'::TIMESTAMPTZ `;
    }

    this.query += `ORDER BY t.created ${desc === 'true' ? 'DESC' : 'ASC '} LIMIT ${+limit}`;

    return this.dataBase.many(this.query);
  }

  addVote(data, thread) {
    this.query = `INSERT INTO votes (userId, threadId, voice) VALUES 
    ((SELECT u.id FROM users u WHERE LOWER(nickname) = LOWER('${data.nickname}')), ${thread.id}, ${data.voice}) 
    ON CONFLICT (userId, threadId) DO 
    UPDATE SET voice = ${data.voice}`;

    return this.dataBase.none(this.query);
  }

  getVotes(id) {
    this.query = `SELECT t.votes FROM threads t 
    WHERE t.id = ${id}`;

    return this.dataBase.one(this.query);
  }

  updateThread(thread, request) {
    this.query = `UPDATE threads 
    SET 
    message = '${request.message ? request.message : thread.message}', 
    title = '${request.title ? request.title : thread.title}' 
    WHERE id = ${+thread.id}`;

    return this.dataBase.none(this.query);
  }
}

const threadService = new ThreadService();
export default threadService;
