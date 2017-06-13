import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  create(data, slug, forum, context = this.dataBase) {
    return context.one(`INSERT INTO threads (author, created, forum, message, slug, title) 
    VALUES ((SELECT nickname FROM users WHERE LOWER(nickname) = LOWER('${data.author}')), 
    ${data.created ? `'${data.created}'::TIMESTAMPTZ` : 'current_timestamp'},
    (SELECT f.slug FROM forums f WHERE LOWER(f.slug) = LOWER('${forum}')), 
    '${data.message}', '${slug}', 
    '${data.title}') 
    RETURNING 
    id::int, 
    author, 
    created, 
    forum, 
    message, 
    slug, 
    title, 
    votes::int`);
  }

  findThreadById(id, context = this.dataBase) {
    return context.oneOrNone(`SELECT t.id::int, t.slug, t.author, t.created, t.forum, t.message, t.title, t.votes::int 
    FROM 
    threads t 
    WHERE t.id = ${id}`);
  }

  findThreadBySlug(slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT t.id::int, t.author, t.forum, 
    t.slug, t.created, t.message, t.title, t.votes::int 
    FROM 
    threads t 
    WHERE LOWER(t.slug) = LOWER('${slug}')`);
  }

  getForumThreads(slug, limit, since, desc, context = this.dataBase) {
    this.query = `SELECT t.id::int, t.slug, t.author,
    t.forum, t.created, t.message, t.title, t.votes::int
    FROM
    threads t
    WHERE LOWER(t.forum) = LOWER('${slug}') `;

    if (since) {
      this.query += 'AND t.created';
      this.query += desc === 'true' ? ` <= ` : ` >= `;
      this.query += `'${since}'::TIMESTAMPTZ `;
    }

    this.query += `ORDER BY t.created ${desc === 'true' ? 'DESC' : 'ASC '} LIMIT ${+limit}`;

    return context.any(this.query);
  }

  addVote(data, thread, context = this.dataBase) {
    return context.none(`INSERT INTO votes (userId, threadId, voice) VALUES 
    ((SELECT u.id FROM users u WHERE LOWER(nickname) = LOWER('${data.nickname}')), ${thread.id}, ${data.voice}) 
    ON CONFLICT (userId, threadId) DO 
    UPDATE SET voice = ${data.voice}`);
  }

  getVotes(id, context = this.dataBase) {
    return context.oneOrNone(`SELECT t.votes::int FROM threads t 
    WHERE t.id = ${id}`);
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
