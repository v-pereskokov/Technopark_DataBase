import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(forum, context = this.dataBase) {
    return context.oneOrNone(`INSERT INTO forums ("user", slug, title) 
    VALUES (
    '${forum.user}',
    '${forum.slug}', 
    '${forum.title}'
    ) 
    RETURNING *`);
  }

  get(slug) {
    return this.dataBase.oneOrNone(`SELECT f.id::int, f.title, f."user", f.slug, f.posts::int, f.threads::int 
    FROM forums f 
    WHERE LOWER(f.slug) = LOWER('${slug}');`);
  }

  updateForums(slug, context = this.dataBase) {
    return context.none(`UPDATE forums SET threads = threads + 1 WHERE LOWER(slug) = LOWER('${slug}')`);
  }

  getSlug(slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT slug FROM forums WHERE LOWER(slug) = LOWER('${slug}');`);
  }

  getId(slug) {
    return this.dataBase.oneOrNone(`SELECT id FROM forums WHERE LOWER(slug) = LOWER('${slug}');`);
  }

  checkAuthor(nickname, context = this.dataBase) {
    return context.oneOrNone(`SELECT id, nickname FROM users WHERE 
    LOWER(nickname) = LOWER('${nickname}')`);
  }
}

const forumService = new ForumService();
export default forumService;
