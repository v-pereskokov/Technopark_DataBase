import BaseService from './baseService';

class PostService extends BaseService {
  constructor() {
    super();
  }

  getCreateBatch(data) {
    this._query = `INSERT INTO posts 
    (id, author, created, forum, is_edited, message, parent, path, thread_id) 
    VALUES (${data.postId}, (SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower('${data.author}')), 
    '${data.created}'::TIMESTAMPTZ, 
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower('${data.forum}')), 
    ${data.isEdited}, '${data.message}', ${data.parent ? `${data.parent}` : 'NULL'}, 
    (SELECT path FROM posts WHERE id = ${data.parent ? `${data.parent}` : 'NULL'}) || ${data.postId}::BIGINT, ${data.threadId}) 
    RETURNING *`;

    return {
      dataBase: this._dataBase,
      query: this._query
    }
  }

  updateForums(size, forum) {
    this._query = `UPDATE forums SET posts = posts + ${size} 
    WHERE lower(slug) = lower('${forum}')`;

    return this._dataBase.none(this._query);
  }
}

const postService = new PostService();
export default postService;
