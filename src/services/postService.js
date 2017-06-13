import BaseService from './baseService';
import makeInsertPostsQuery from '../tools/makeInsertPostsQuery';

class PostService extends BaseService {
  constructor() {
    super();
  }

  createAsBatch(posts, thread, context = this.dataBase) {
    return context.tx(transaction => {
      for (let post of posts) {
        post.forum = thread.forum;
        post.thread = +thread.id;
      }

      return transaction.manyOrNone(makeInsertPostsQuery(posts));
    });
  }

  updateForums(size, forum, context = this.dataBase) {
    return context.none(`UPDATE forums SET posts = posts + ${size} 
    WHERE lower(slug) = lower('${forum}')`);
  }

  getPostsFlatSort(id, desc, limit, offset) {
    return this.dataBase.manyOrNone(`SELECT p.id::int, p.author, p.forum, p.created, p.message, p.threadId::int as thread, p.parent::int, p.isEdited 
    FROM posts p 
    WHERE p.threadId = ${id} 
    ORDER BY p.id ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset}`);
  }

  getPostsTreeSort(id, desc, limit, offset) {
    return this.dataBase.manyOrNone(`SELECT p.id::int, p.author, p.forum, p.created, p.message, p.threadId::int as thread, p.parent::int, p.isEdited 
    FROM posts p 
    WHERE p.threadId = ${id} 
    ORDER BY p.path ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset}`);
  }

  getPostsParentTreeSort(id, desc, limit, offset) {
    return this.dataBase.manyOrNone(`WITH sub AS (
    SELECT path FROM posts 
    WHERE parent IS NULL AND threadId = ${id} 
    ORDER BY path ${desc === 'true' ? 'DESC' : 'ASC'} 
    LIMIT ${limit} OFFSET ${offset} 
    ) 
    SELECT p.id::int, p.author, p.forum, p.created, p.message, p.threadId::int as thread, p.parent::int, p.isEdited 
    FROM posts p 
    JOIN sub ON sub.path <@ p.path 
    ORDER BY p.path ${desc === 'true' ? 'DESC' : 'ASC'}`);
  }

  getPostById(id) {
    return this.dataBase.oneOrNone(`SELECT p.id::int, p.forum, p.author, p.message, p.threadId, 
    p.parent, p.created, p.isEdited as "isEdited"
    FROM posts p 
    WHERE p.id = ${id}`);
  }

  updatePost(post) {
    return this.dataBase.none(`UPDATE posts SET 
    message = '${post.message}', 
    isEdited = ${post.isedited ? post.isedited : false} 
    WHERE id = ${post.id}`);
  }

  getPosts(id, context = this.dataBase) {
    return context.manyOrNone(`SELECT * FROM posts WHERE threadId = ${id}`);
  }
}

const postService = new PostService();
export default postService;
