import BaseService from './baseService';
import makeInsertPostsQuery from '../tools/makeInsertPostsQuery';

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

  getThreadForAdd(slug) {
    const isNum = !!(+slug);

    return this.dataBase.oneOrNone(`SELECT t.id, f.slug, f.id as \"forumId\" 
    FROM threads t 
    INNER JOIN forums f ON (t.forum = f.id) 
    WHERE t.${isNum ? 'id' : 'slug'} = ${isNum ? +slug : slug}`);
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

  getVote(nickname, id) {
    return this.dataBase.one(`SELECT id, voice 
    FROM votes 
    WHERE username = '${nickname}' and thread = ${id}`);
  }

  createVote(nickname, voice, id, context = this.dataBase) {
    return context.none(`INSERT INTO votes (username, voice, thread) 
    VALUES ('${nickname}', ${voice}, ${id})`);
  }

  updateThreads(id, voice, context = this.dataBase) {
    return context.none(`UPDATE threads 
    SET votes = votes + ${voice} 
    WHERE id = ${id}`);
  }

  updateVotes(id, voice, context = this.dataBase) {
    return context.none(`UPDATE votes 
    SET voice = ${voice} 
    WHERE id = ${id}`);
  }

  getthread(query, slug) {
    return this.dataBase.one('select threads.id, forums.slug, forums.id as \"forumId\" from threads inner join forums on threads.forum = forums.id ' +
      ' where ' + query + ' = $1', slug);
  }

  getpost(parent, threadId, context = this.dataBase) {
    return context.one('select path, id from posts where id = ' + parent + ' and thread = ' + threadId);
  }

  getnext(length, context = this.dataBase) {
    return context.any('SELECT nextval(\'posts_id_seq\') from generate_series(1, $1)', length);
  }

  updateforums(length, forumSlug, context = this.dataBase) {
    return context.none('update forums set (posts) = (posts + ' + length + ') where forums.slug = $1', forumSlug);
  }

  addPosts(posts, forumId, context = this.dataBase) {
    const request = makeInsertPostsQuery(posts, forumId);
    return context.none(request.query, request.creat);
  }
}

const threadService = new ThreadService();
export default threadService;
