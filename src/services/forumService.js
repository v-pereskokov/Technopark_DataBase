import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(user, context = this.dataBase) {
    return context.one(`WITH ins_result AS ( 
      INSERT INTO forums 
        AS column_insert (slug, title, "user")  
        SELECT 
        '${user.slug}',
        '${user.title}',
        '${user.nickname}'
        WHERE 
        'inserted' = SET_CONFIG('upsert.action', 'inserted', true)
            ON CONFLICT (LOWER(slug)) DO UPDATE
        SET slug = column_insert.slug 
        WHERE
            'updated' = SET_CONFIG('upsert.action', 'updated', true)
             RETURNING *
      )
        SELECT
            CURRENT_SETTING('upsert.action') AS "action",
            ins.slug,
            ins.title,
            ins."user"
        from
            ins_result ins`);
  }

  get(slug) {
    return this.dataBase.oneOrNone(`SELECT f.id, f.title, f."user", f.slug, f.posts, f.threads 
    FROM forums f 
    WHERE LOWER(f.slug) = LOWER('${slug}');`);
  }

  updateForums(slug) {
    this.query = `UPDATE forums SET threads = threads + 1 WHERE LOWER(slug) = LOWER('${slug}')`;

    return this.dataBase.none(this.query);
  }

  getSlug(slug) {
    this.query = `SELECT slug FROM forums WHERE LOWER(slug) = LOWER('${slug}');`;

    return this.dataBase.one(this.query);
  }

  getId(slug) {
    this.query = `SELECT id FROM forums WHERE LOWER(slug) = LOWER('${slug}');`;

    return this.dataBase.one(this.query);
  }

  checkAuthor(nickname, context = this.dataBase) {
    return context.oneOrNone(`SELECT id, nickname FROM users WHERE 
    nickname = '${nickname}'::citext`);
  }
}

const forumService = new ForumService();
export default forumService;
