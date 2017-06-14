import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  create(thread, context = this.dataBase) {
    return context.one(`INSERT INTO threads 
    (author, forum, message, title ${thread.slugThread ? ', slug' : ''} ${thread.created ? ', created' : ''}) 
    VALUES (
    '${thread.user}', 
    ${thread.id}, 
    '${thread.message}', 
    '${thread.title}' 
    ${thread.slugThread ? `, '${thread.slugThread}'` : ''} 
    ${thread.created ? `, '${thread.created}'` : ''}) 
    RETURNING id`);
  }

  getThread(id, context = this.dataBase) {
    return context.oneOrNone(`SELECT f.slug as "forum", t.author, t.id, t.slug, t.title, t.message, t.created, t.votes 
    FROM threads t 
    INNER JOIN forums f ON (t.forum = f.id) 
    WHERE t.id = ${id}`);
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

  getSortedThreads(id, desc, since, limit) {
    this.query = `SELECT t.slug, t.id, t.title, t.message, t.author, t.created, t.votes, f.slug as "forum" 
    FROM threads t 
    INNER JOIN forums f ON (f.id = t.forum) 
    WHERE t.forum = ${id}`;

    if (since) {
      this.query += ` AND t.created ${desc === 'true' ? '<=' : '>='} '${since}'`;
    }

    this.query += ` ORDER BY t.created ${desc === 'true' ? 'DESC' : 'ASC'}`;

    if (limit) {
      this.query += ` LIMIT ${limit}`;
    }

    return this.dataBase.any(this.query);
  }

  getSortedUsers(id, desc, since, limit) {
    this.query = `SELECT DISTINCT ON (
    LOWER(uf.user_nickname) COLLATE "ucs_basic") 
    u.nickname, u.fullname, u.email, u.about 
    FROM usersForums uf 
    JOIN users u ON (uf.user_nickname = u.nickname) 
    WHERE uf.forum_id = ${id}`;

    if (since) {
      this.query += ` AND LOWER(uf.user_nickname) COLLATE "ucs_basic" ${desc === 'true' ? '<' : '>'} 
      LOWER('${since}') COLLATE "ucs_basic"`
    }

    this.query += ` ORDER BY LOWER(uf.user_nickname) COLLATE "ucs_basic" ${desc === 'true' ? 'DESC' : 'ASC'}`;

    if (limit !== 0) {
      this.query += ` LIMIT ${limit}`;
    }

    return this.dataBase.any(this.query)
  }

  getthread(query, slug) {
    return this.dataBase.one('select threads.id, forums.slug, forums.id as \"forumId\" from threads inner join forums on threads.forum = forums.id ' +
      ' where ' + query + ' = $1', slug)
  }

  getpath(parent, threadId, context = this.dataBase) {
    return context.one('select path, id from posts where id = ' + parent + ' and thread = ' + threadId);
  }

  getnextval(length, context = this.dataBase) {
    return context.any('SELECT nextval(\'posts_id_seq\') from generate_series(1, $1)', length);
  }

  updateforums(length, forumSlug, context = this.dataBase) {
    return context.none('update forums set (posts) = (posts + ' + length + ') where forums.slug = $1', forumSlug)
  }
}

const threadService = new ThreadService();
export default threadService;
