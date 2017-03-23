const dataBase = require('../../database/DataBase');
const userService = require('../UserService/UserService');
const forumService = require('../ForumService/ForumService');
const threadService = require('../ThreadService/ThreadService');

class PostService {
  constructor() {
    this._query = '';
  }

  getPost(id) {
    this._query = `SELECT * FROM posts WHERE id = ${id}`;

    return dataBase.dataBase.one(this._query);
  }

  updatePost(message, id) {
    this._query = `UPDATE posts SET (message, isEdited) = (\'${message}\', true) 
    WHERE id = ${id};`;

    return dataBase.dataBase.none(this._query);
  }

  getDetailedPost(post) {
    this._query = `SELECT A.about userabout, A.email useremail, A.fullname userfullname, 
    T.author threadauthor, T.created threadcreated, T.message threadmessage, T.slug threadslug, 
    T.title threadtitle, 
    F.posts forumposts, F.slug forumslug, F.threads forumthreads, 
    F.title forumtitle, F.username forumuser 
    FROM threads T INNER JOIN forums F ON (T.forum = F.id) INNER JOIN 
    posts P ON (P.thread = T.id) INNER JOIN 
    users A ON (P.author = A.nickname) 
    WHERE P.id = ${post.id} AND 
    A.nickname = \'${post.nickname}\' AND 
    T.id = ${post.threadId} AND
    F.slug = \'${post.forumSlug}\';`;

    return dataBase.dataBase.one(this._query);
  }
}

const postService = new PostService();

module.exports.postService = postService;
