import BaseService from './baseService';

class PostService extends BaseService {
  constructor() {
    super();
  }

  createAsBatch(posts, thread, context = this.dataBase) {
    return context.tx(async (transaction) => {
      const queries = [];

      for (let post of posts) {
        post.forum = thread.forum;
        post.thread = +thread.id;

        queries.push(transaction.oneOrNone(this.getCreateBatchQuery(post)));
      }

      return await transaction.batch(queries);
    });
  }

  getCreateBatchQuery(data) {
    this.query = `INSERT INTO posts 
    (id, author, forum, isEdited, message, parent, path, threadId) 
    VALUES (nextval('posts_id_seq'), '${data.author}', 
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), 
    ${data.isEdited ? data.isEdited : 'FALSE'}, '${data.message}', ${data.parent ? `${data.parent}` : 'NULL'}, 
    (SELECT path FROM posts WHERE id = ${data.parent ? `${data.parent}` : 'NULL'}) || currval('posts_id_seq')::BIGINT, 
    ${data.thread})
    RETURNING 
    id::int, 
    author, 
    created, 
    forum, 
    isedited as "isEdited", 
    message, 
    parent::int, 
    path, 
    threadId::int as "thread"`;

    return this.query;
  }

  updateForums(size, forum, context = this.dataBase) {
    return context.none(`UPDATE forums SET posts = posts + ${size} 
    WHERE lower(slug) = lower('${forum}')`);
  }

  getPostsFlatSort(id, desc, limit, offset) {
    this.query = `SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.isEdited 
    FROM posts p 
    WHERE p.threadId = ${id} 
    ORDER BY p.id ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset}`;

    return this.dataBase.manyOrNone(this.query);
  }

  getPostsTreeSort(id, desc, limit, offset) {
    this.query = `SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.isEdited 
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
    SELECT p.id, p.author, p.forum, p.created, p.message, p.threadId, p.parent, p.isEdited 
    FROM posts p 
    JOIN sub ON sub.path <@ p.path 
    ORDER BY p.path ${desc === 'true' ? 'DESC' : 'ASC'}`;

    return this.dataBase.manyOrNone(this.query);
  }

  getPostById(id) {
    this.query = `SELECT p.id, p.forum, p.author, p.message, p.threadId, 
    p.parent, p.created, p.isEdited 
    FROM posts p 
    WHERE p.id = ${id}`;

    return this.dataBase.oneOrNone(this.query);
  }

  updatePost(post) {
    this.query = `UPDATE posts SET 
    message = '${post.message}', 
    isEdited = ${post.isedited ? post.isedited : false} 
    WHERE id = ${post.id}`;

    return this.dataBase.none(this.query);
  }

  getPosts(id) {
    this.query = `SELECT * FROM posts WHERE threadId = ${id}`;

    return this.dataBase.manyOrNone(this.query);
  }
}

const postService = new PostService();
export default postService;
