import BaseService from './baseService';

class PostService extends BaseService {
  constructor() {
    super();
  }

  getCreateBatch() {
    this._query = `INSERT INTO posts 
    (id, author, created, forum, is_edited, message, parent, path, thread_id) 
    VALUES ($1, (SELECT u.nickname FROM users u WHERE lower(u.nickname) = lower($2)), $3::TIMESTAMPTZ, 
    (SELECT f.slug FROM forums f WHERE lower(f.slug) = lower($4)), $5, $6, $7, 
    (SELECT path FROM posts WHERE id = $8) || $9::BIGINT, $10) `;

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
