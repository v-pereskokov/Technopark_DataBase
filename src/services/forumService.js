import BaseService from './baseService';

class ForumService extends BaseService {
  constructor() {
    super();
  }

  create(forum, context = this.dataBase) {
    return context.one(`INSERT INTO forums ("user", slug, title) 
    VALUES (
    (SELECT nickname FROM users WHERE LOWER(nickname) = LOWER('${forum.user}')),
    '${forum.slug}', 
    '${forum.title}'
    )`)
  }

  oldCreate(user, context = this.dataBase) {
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
    nickname = '${nickname}'::citext`);
  }
}

const forumService = new ForumService();
export default forumService;
