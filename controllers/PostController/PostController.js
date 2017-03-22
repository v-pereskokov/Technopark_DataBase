const userService = require('../../services/UserService/UserService');
const forumService = require('../../services/ForumService/ForumService');
const threadService = require('../../services/ThreadService/ThreadService');
const dataBase = require('../../database/DataBase');

class PostController {
  constructor() {
  }

  getPost(ctx, next) {
    return new Promise(resolve => {
      let id = ctx.params.id;
      let related = ctx.query.related;
      let user = '';
      let thread = '';
      let forum = '';
      let u, t, d, f, author, threadid, forumslug;
      if(!isEmpty(related)) {
        if (related.indexOf('user') !== -1) {
          user = 'user';
        }
        if (related.indexOf('thread') !== -1) {
          thread = 'thread';
        }
        if (related.indexOf('forum') !== -1) {
          forum = 'forum';
        }
      }

      dataBase.dataBase.one('select * from posts where posts.id = $1', id)
        .then(function (data) {
          author = data.author;
          threadid = data.thread;
          forumslug = data.forum;
          d = JSON.stringify(data);
          d = JSON.parse(d);
          if(user === 'user') {
            return dataBase.dataBase.one('select * from users where users.nickname = $1', author);
          } else if (thread === 'thread') {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.id, threads.slug, threads.title,' +
              ' threads.message, threads.created from threads inner join forums on (threads.forum=forums.id)' +
              ' where threads.id = $1', threadid);
          } else if(forum === 'forum') {
            return dataBase.dataBase.one('select forums.slug, forums.username as \"user\", forums.title, forums.posts,' +
              ' forums.threads from forums where forums.slug = $1', forumslug);
          } else {
            ctx.body = {
              post: d
            };
            ctx.status = 200;
            resolve();
          }
        })
        .then(function (data) {
          if(user === 'user') {
            u = JSON.stringify(data);
            u = JSON.parse(u);
            if(thread === 'thread') {
              return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.id, threads.slug, threads.title,' +
                ' threads.message, threads.created from threads inner join forums on (threads.forum=forums.id)' +
                ' where threads.id = $1', threadid);
            } else if (forum === 'forum') {
              return dataBase.database.one('select forums.slug, forums.username as \"user\", forums.title, forums.posts,' +
                ' forums.threads from forums where forums.slug = $1', forumslug);
            } else {
              ctx.body = {
                author: u,
                post: d
              };
              ctx.status = 200;
              resolve();
            }
          } else if(thread === 'thread'){
            t = JSON.stringify(data);
            t = JSON.parse(t);
            if(forum === 'forum') {
              return dataBase.dataBase.one('select forums.slug, forums.username as \"user\", forums.title, forums.posts,' +
                ' forums.threads from forums where forums.slug = $1', forumslug);
            } else {
              ctx.body = {
                thread: t,
                post: d
              };
              ctx.status = 200;
              resolve();
            }
          } else {
            f = JSON.stringify(data);
            f = JSON.parse(f);
            ctx.body = {
              forum: f,
              post: d
            };
            ctx.status = 200;
            resolve();
          }
        })
        .then(function (data) {
          if(user === 'user') {
            if(thread === 'thread') {
              t = JSON.stringify(data);
              t = JSON.parse(t);
              if(forum === 'forum') {
                return dataBase.dataBase.one('select forums.slug, forums.username as \"user\", forums.title, forums.posts,' +
                  ' forums.threads from forums where forums.slug = $1', forumslug);
              } else {
                console.log('');
                console.log('');
                console.log({
                  author: u,
                  thread: t,
                  post: d
                });

                const kostyl = {
                  author: u,
                  thread: t,
                  post: d
                };

                ctx.body = {
                  author: kostyl.author,
                  thread: kostyl.thread,
                  post: kostyl.post
                };
                ctx.status = 200;
                resolve();
                return true;
              }
            } else {
              f = JSON.stringify(data);
              f = JSON.parse(f);
              ctx.body = {
                author: u,
                forum: f,
                post: d
              };
              ctx.status = 200;
              resolve();
            }
          }
          if(thread === 'thread') {
            f = JSON.stringify(data);
            f = JSON.parse(f);
            ctx.body = {
              thread: t,
              forum: f,
              post: d
            };
            ctx.status = 200;
            resolve();
          } else if (forum === 'forum') {
            f = JSON.stringify(data);
            f = JSON.parse(f);
            ctx.body = {
              author: u,
              forum: f,
              post: d
            };
            ctx.status = 200;
            resolve();
          }
        })
        .then(function (data) {
          f = JSON.stringify(data);
          f = JSON.parse(f);
          ctx.body = {
            author: u,
            thread: t,
            forum: f,
            post: d
          };
          ctx.status = 200;
          resolve();
        })
        .catch(function (err) {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  updatePost(ctx, next) {
    return new Promise(resolve => {
      let id = ctx.params.id;
      let message = ctx.request.body.message;

      dataBase.dataBase.one('select * from posts where posts.id = $1', id)
        .then(function (data) {
          if (!isEmpty(message)) {
            if (message !== data.message) {
              return dataBase.dataBase.none('update posts set (message, isEdited) = (\'' + ctx.request.body.message + '\', true)' +
                ' where posts.id = $1', id);
            } else {
              let d = JSON.stringify(data);
              d = JSON.parse(d);
              ctx.body = d;
              ctx.status = 200;
              resolve();
            }
          } else {
            let d = JSON.stringify(data);
            d = JSON.parse(d);
            ctx.body = d;
            ctx.status = 200;
            resolve();
          }
        })
        .then(function () {
          return dataBase.dataBase.one('select * from posts where posts.id = $1', id);
        })
        .then(function (data) {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          ctx.body = d;
          ctx.status = 200;
          resolve();
        })
        .catch(function (err) {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function compareNumeric(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
}

const postController = new PostController();

module.exports.postController = postController;
