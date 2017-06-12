import BaseService from './baseService';

class ThreadService extends BaseService {
  constructor() {
    super();
  }

  // delete subq forum
  topCreate(data, context = this.dataBase) {
    return context.oneOrNone(`with inserted_result as (insert
into
    threads as ci
    (author, created, forum, message, slug, title) select
        '${data.username}',
        ${data.created ? `'${data.created}'::TIMESTAMPTZ` : 'current_timestamp'},
        (SELECT f.slug FROM forums f WHERE LOWER(f.slug) = LOWER('${data.forum}')),
        '${data.message}',
        '${data.slug}',
        '${data.title}'
    where
        'inserted' = set_config('upsert.action', 'inserted', true)
            on conflict (LOWER(slug)) do update
        set
            id = ci.id
        where
            'updated' = set_config('upsert.action', 'updated', true)
             returning *)
        select
            current_setting('upsert.action') AS "action",
            t.id::int, 
            t.author, 
            t.created, 
            t.forum, 
            t.message, 
            t.slug, 
            t.title, 
            t.votes::int
        from
            inserted_result t;`);
  }

  // optimize created?
  create(data, context = this.dataBase) {
    return context.oneOrNone(`INSERT INTO threads (author, created, forum, message, slug, title) 
    VALUES ('${data.username}', 
    ${data.created ? `'${data.created}'::TIMESTAMPTZ` : 'current_timestamp'},
    (SELECT f.slug FROM forums f WHERE LOWER(f.slug) = LOWER('${data.forum}')), 
    '${data.message}', '${data.slug}', 
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
    return context.oneOrNone(`SELECT t.id, t.slug, t.author, t.created, t.forum, t.message, t.title, t.votes 
    FROM 
    threads t 
    WHERE t.id = ${id}`);
  }

  findThreadBySlug(slug, context = this.dataBase) {
    return context.oneOrNone(`SELECT t.id::int, t.author, t.forum, 
    t.slug, t.created, t.message, t.title, t.votes 
    FROM 
    threads t 
    WHERE t.slug = '${slug}'::citext`);
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

    return `select case when (select id from "user" where
     nickname<>'${nickname}'::citext and email='${email}'::citext)
     is not null then true else false end as "conflict", case when (select id from "user" where
     nickname='${nickname}'::citext) is not null then false else true end as "notfound"`;
  }

  getPostsAndUser(threadId, nickname, context = this.dataBase) {
    return context.any(`SELECT 
    CASE WHEN (
      SELECT id 
      FROM users
      WHERE nickname = '${nickname}'::citext
    ) IS NOT NULL THEN TRUE ELSE FALSE END AS "notfound",  
    CASE WHEN (
      `);






    // return context.any(`WITH author AS (
    //     SELECT id, nickname
    //     FROM users
    //     WHERE nickname = '${nickname}'::citext
    //   ),
    //   post AS (
    //     SELECT id, CAST(threadId AS text) as tid
    //     FROM posts
    //     WHERE threadId = ${threadId}
    //   )
    //   SELECT id AS first, nickname AS second
    //   FROM author
    //   UNION ALL
    //   SELECT id, tid
    //   FROM post`);
  }
}

const threadService = new ThreadService();
export default threadService;
