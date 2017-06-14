import BaseService from './baseService';
import makeInsertPostsQuery from '../tools/makeInsertPostsQuery';

class PostService extends BaseService {
  constructor() {
    super();
  }

  getPost(id) {
    return this.dataBase.oneOrNone(`SELECT id, author, created, forum, isEdited as "isEdited", message, thread, parent 
    FROM posts 
    WHERE id = ${id}`);
  }

  createAsBatch(posts, thread, context = this.dataBase) {
    return context.manyOrNone(makeInsertPostsQuery(posts, thread));
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
    isEdited = ${post.isEdited ? post.isEdited : false} 
    WHERE id = ${post.id}`);
  }

  getPosts(id, context = this.dataBase) {
    return context.manyOrNone(`SELECT * FROM posts WHERE threadId = ${id}`);
  }
}

const postService = new PostService();
export default postService;
