const userService = require('../../services/UserService/UserService');
const forumService = require('../../services/ForumService/ForumService');
const threadService = require('../../services/ThreadService/ThreadService');
const dataBase = require('../../database/DataBase');

class ForumController {
  constructor() {

  }

  create(ctx, next) {
    return new Promise(resolve => {
      const body = ctx.request.body;

      forumService.forumService.getForumByUsername(body.user)
        .then(() => {
          return userService.userService.getUserByNickname(body.user);
        })
        .then(data => {
          return forumService.forumService.createForum({
            slug: body.slug,
            title: body.title,
            username: data.nickname
          });
        })
        .then(() => {
          return forumService.forumService.getForumByUsername(body.user, true);
        })
        .then(data => {
          ctx.body = {
            slug: data.slug,
            title: data.title,
            user: data.username
          };
          ctx.status = 201;
          resolve();
        })
        .catch(error => {
          return forumService.forumService.getForumByUsername(body.user, true)
            .then(data => {
              ctx.body = {
                slug: data.slug,
                title: data.title,
                user: data.username
              };
              ctx.status = 409;
              resolve();
            })
        })
        .catch(error => {
          ctx.body = error;
          ctx.status = 404;
          resolve();
        });
    });
  }

  get(ctx, next) {
    return new Promise(resolve => {
      const slug = ctx.params.slug;

      forumService.forumService.getForumBySlugNotAll([
        'title',
        'username',
        'slug',
        'posts',
        'threads',
      ], slug)
        .then(data => {
          const parsingData = JSON.parse(JSON.stringify(data));

          ctx.body = {
            slug: parsingData.slug,
            title: parsingData.title,
            user: parsingData.username,
            posts: parsingData.posts,
            threads: parsingData.threads
          };
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  createThread(ctx, next) {
    return new Promise(resolve => {
      const author = ctx.request.body.author;
      const created = ctx.request.body.created;
      const title = ctx.request.body.title;
      const message = ctx.request.body.message;

      let forum = ctx.request.body.forum;
      let slug = !isEmpty(ctx.request.body.slug) ? ctx.request.body.slug :
        ctx.params.slug;

     threadService.threadService.getThreadBySlug(slug)
        .catch(error => {
          return threadService.threadService.getThread(slug)
            .then(data => {
              ctx.body = JSON.parse(JSON.stringify(data));
              ctx.status = 409;
              resolve();
            });
        })
        .then(() => {
          return forumService.forumService.getForumBySlug(forum);
        })
        .then(data => {
          forum = data.slug;

          return threadService.threadService.create({
            author: author,
            forum: data.id,
            message: message,
            title: title,
            created: !isEmpty(created) ? created : null,
            slug: slug
          });
        })
        .then(() => {
          return forumService.forumService.getFieldBy('threads', {
            name: 'slug',
            value: forum
          })
        })
        .then(data => {
          return forumService.forumService.updateFields('threads', `${++(data.threads)}`, {
            name: 'slug',
            value: forum
          });
        })
        .then(() => {
          return threadService.threadService.getThreadBySlug(slug, true);
        })
        .then(data => {
          if(isEmpty(created)) {
            if(isEmpty(ctx.request.body.slug)) {
              ctx.body = {
                author: data.author,
                forum: forum,
                id: data.id,
                message: data.message,
                title: data.title
              };
              ctx.status = 201;
              resolve();
            } else {
              ctx.body = {
                author: data.author,
                slug: data.slug,
                forum: forum,
                id: data.id,
                message: data.message,
                title: data.title
              };
              ctx.status = 201;
              resolve();
            }
          } else if (isEmpty(ctx.request.body.slug)) {
            ctx.body = {
              author: data.author,
              created: data.created,
              forum: forum,
              id: data.id,
              message: data.message,
              title: data.title
            };
            ctx.status = 201;
            resolve();
          } else {
            ctx.body = {
              author: data.author,
              created: data.created,
              slug: data.slug,
              forum: forum,
              id: data.id,
              message: data.message,
              title: data.title
            };
            ctx.status = 201;
            resolve();
          }
        })
        .catch(error => {
          ctx.body = error;
          ctx.status = 404;
          resolve();
        })
    });
  }

  getThreads(ctx, next) {
    return new Promise(resolve => {
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      forumService.forumService.getForumBySlug(slug)
        .then(data => {
          let str = 'select threads.slug, threads.id, threads.title, threads.message, threads.author, threads.created, forums.slug as forum' +
            ' from threads INNER JOIN forums ON (forums.id = threads.forum) where threads.forum = $1';
          let query = str;
          if(!isEmpty(since)) {
            if(desc === "true") {
              query = query + " and threads.created <= $2";
            } else {
              query = query + " and threads.created >= $2";
            }
          }
          query = query +  ' order by threads.created';
          if(!isEmpty(desc)) {
            if(desc === "true") {
              query = query + " desc";
            }
          }
          if(!isEmpty(limit)) {
            query = query + " limit " + limit;
          }
          if(isEmpty(since)) {
            return dataBase.dataBase.any(query, data.id)
          } else {
            return dataBase.dataBase.any(query, [data.id, since])
          }
        })
        .then(data => {
          ctx.body = data;
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  getUsers(ctx, next) {
    return new Promise(resolve => {
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      dataBase.dataBase.one('select * from forums where upper(slug) = $1', slug.toUpperCase())
        .then(data => {
          let query = 'select * from users where (users.nickname in (' +
            ' select distinct threads.author from threads where threads.forum = $1 ) or users.nickname in (' +
            ' select distinct posts.author from posts where posts.forum = $2 )) ';
          if(!isEmpty(since)) {
            if(desc === "true") {
              query = query + ' and lower(users.nickname) collate "ucs_basic" < ' +
                'lower($3) collate "ucs_basic"';
            } else {
              query = query + ' and lower(users.nickname) collate "ucs_basic" > ' +
                'lower($3) collate "ucs_basic"';
            }
          }
          query = query +  ' order by lower(users.nickname) collate "ucs_basic"';
          if(desc === "true") {
            query = query + " desc";
          } else {
            query = query + " asc";
          }
          if(!isEmpty(limit)) {
            query = query + " limit " + limit;
          }
          if(!isEmpty(since)) {
            return dataBase.dataBase.any(query, [data.id, data.slug, since]);
          } else {
            return dataBase.dataBase.any(query, [data.id, data.slug]);
          }
        })
        .then(data => {
          ctx.body = data;
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
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

const forumController = new ForumController();

module.exports.forumController = forumController;
