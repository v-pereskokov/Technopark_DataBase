import BaseService from './baseService';
import makeInsertPostsQuery from '../tools/makeInsertPostsQuery';

class PostService extends BaseService {
  constructor() {
    super();
  }

  addPosts(id, data, context = this.dataBase) {
    return context.none(makeInsertPostsQuery(id, data));
  }

  getPost(id, context = this.dataBase) {
    return context.oneOrNone(`SELECT id, author, created, forum, isEdited as "isEdited", message, thread, parent 
    FROM posts 
    WHERE id = ${id}`);
  }

  getPostOne(id, context = this.dataBase) {
    return context.one(`SELECT id, author, created, forum, isEdited as "isEdited", message, thread, parent 
    FROM posts 
    WHERE id = ${id}`);
  }

  update(id, message, context = this.dataBase) {
    return context.none(`UPDATE posts 
    SET (message, isEdited) = 
    ('${message}', TRUE)  
    WHERE id = ${id}`);
  }

  getPath(id, parent, context = this.dataBase) {
    return context.one(`SELECT path, id 
    FROM posts 
    WHERE id = parent AND thread = id`);
  }

  getNextVal(length, context = this.dataBase) {
    return context.any(`SELECT nextval(\'posts_id_seq\') from generate_series(1, ${length})`);
  }
}

const postService = new PostService();
export default postService;
