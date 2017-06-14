import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(username, forum, context = this.dataBase) {
    return context.oneOrNone(`INSERT INTO forums (username, slug, title) 
    VALUES (
    '${username}',
    '${forum.slug}', 
    '${forum.title}'
    )`);
  }

  get(username, slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT title, username as "user", slug, posts, threads  
    FROM forums 
    WHERE username = '${username}' AND slug = '${slug}'`);
  }

  updateForums(id, context = this.dataBase) {
    return context.none(`UPDATE forums SET threads = threads + 1 
    WHERE id = ${id}`);
  }

  getBySlug(slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT title, username as "user", slug, posts, threads  
    FROM forums 
    WHERE slug = '${slug}'`);
  }

  getId(slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT id FROM forums 
    WHERE slug = '${slug}'`);
  }

  getThread(slug) {
    return this.dataBase.oneOrNone(`SELECT t.id, t.author, t.message, t.title, t.slug, t.created, f.slug as "forum" 
    FROM threads t 
    INNER JOIN forums f ON(t.forum = f.id) 
    WHERE t.slug = '${slug}'`);
  }

  getThreadById(id) {
    return this.dataBase.oneOrNone(`SELECT t.id, t.author, t.message, t.title, t.slug, t.created, f.slug as "forum" 
    FROM threads t 
    INNER JOIN forums f ON(t.forum = f.id) 
    WHERE t.id = '${id}'`);
  }

  checkAuthor(nickname, context = this.dataBase) {
    return context.oneOrNone(`SELECT id, nickname FROM users 
    WHERE LOWER(nickname) = LOWER('${nickname}')`);
  }

  insertUF(data, context = this.dataBase) {
    return context.none(`INSERT INTO usersForums 
    VALUES ('${data.user}', '${data.id}')`);
  }

  getAllForum(slug) {
    return this.dataBase.oneOrNone(`SELECT *
    FROM forums 
    WHERE slug = '${slug}'`);
  }

  getForumId(slug) {
    return this.dataBase.oneOrNone(`SELECT id 
    FROM forums 
    WHERE slug = '${slug}'`);
  }
}

const forumService = new ForumService();
export default forumService;
