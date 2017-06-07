import BaseService from './baseService';

class PostService extends BaseService {
  constructor() {
    super();
  }

  createAsBatch(posts, thread) {
    const date = new Date().toISOString();

    return this.dataBase.tx(async (transaction) => {
      const queries = [];

      for (let post of posts) {
        const id = await this.getNextId();

        queries.push(transaction.any(this.getCreateBatchQuery({
          postId: +id.id,
          author: post.author,
          created: date,
          forum: thread.forum,
          isEdited: post.is_edited ? post.is_edited : 'FALSE',
          message: post.message,
          parent: post.parent,
          threadId: thread.id
        })));
      }

      return await transaction.batch(queries);
    });
  }

  getCreateBatchQuery(data) {
    this.query = `INSERT INTO posts 
    (id, author, created, forum, is_edited, message, parent, path, threadId) 
    VALUES (${data.postId}, (SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower('${data.author}')), 
    '${data.created}'::TIMESTAMPTZ, 
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), 
    ${data.isEdited}, '${data.message}', ${data.parent ? `${data.parent}` : 'NULL'}, 
    (SELECT path FROM posts WHERE id = ${data.parent ? `${data.parent}` : 'NULL'}) || ${data.postId}::BIGINT, ${data.threadId}) 
    RETURNING *`;

    return this.query;
  }

  getNextId() {
    this.query = `SELECT nextval('posts_id_seq') as id`;

    return this.dataBase.one(this.query);
  }

  updateForums(size, forum) {
    this.query = `UPDATE forums SET posts = posts + ${size} 
    WHERE lower(slug) = lower('${forum}')`;

    return this.dataBase.none(this.query);
  }

  getPostsFlatSort(id, desc, limit, offset) {
    this.query = `SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.is_edited 
    FROM posts p 
    WHERE p.threadId = ${id} 
    ORDER BY p.id ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset}`;

    return this.dataBase.manyOrNone(this.query);
  }

  getPostsTreeSort(id, desc, limit, offset) {
    this.query = `SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.is_edited 
    FROM posts p 
    WHERE p.threadId = ${id} 
    ORDER BY p.path ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset}`;

    return this.dataBase.manyOrNone(this.query);
  }

  getPostsParentTreeSort(id, desc, limit, offset) {
    this.query = `WITH sub AS (
    SELECT path FROM posts 
    WHERE parent IS NULL AND threadId = ${id} 
    ORDER BY path ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset} 
    ) 
    SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.is_edited 
    FROM posts p 
    JOIN sub ON sub.path <@ p.path 
    ORDER BY p.path ${desc === 'true' ? 'DESC' : 'ASC'}`;

    return this.dataBase.manyOrNone(this.query);
  }
}

const postService = new PostService();
export default postService;
