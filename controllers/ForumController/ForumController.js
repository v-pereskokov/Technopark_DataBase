const forumService = require('../../services/ForumService/ForumService');
const userService = require('../../services/UserService/UserService');

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
        'forums.title',
        'forums.username',
        'forums.slug',
        'forums.posts',
        'forums.threads',
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
      let slug = ctx.request.body.slug;

      if(!isEmpty(req.body.slug))  {
        slug = req.body.slug;
      }

      db.none('select * from threads where upper(slug) = $1', slug.toUpperCase())
        .catch(function (err) {
          return db.one('select threads.id, threads.author, threads.created, threads.message, threads.slug, ' +
            'threads.title, forums.slug as forum from threads inner join forums on (forums.id = threads.forum) ' +
            'where upper(threads.slug) = $1', slug.toUpperCase())
            .then(function (data) {
              d = JSON.stringify(data);
              d = JSON.parse(d);
              res.status(409).send(d);
            });
        })
        .then(function () {
          return db.one('select * from forums where upper(slug) = $1', forum.toUpperCase())
        })
        .then(function (data) {
          forum = data.slug;
          if(isEmpty(created)) {
            return db.none('insert into threads (author, forum, message, title, slug) ' +
              'values (\'' + author + '\',' + data.id + ',\'' + message + '\',' +
              '\'' + title + '\',\'' + slug + '\')')
          } else {
            return db.none('insert into threads (author, created, forum, message, title, slug) ' +
              'values (\'' + author + '\',\'' + created + '\',' + data.id + ',\'' + message + '\',' +
              '\'' + title + '\',\'' + slug + '\')')
          }
        })
        .then(function () {
          return db.one('select forums.threads from forums where upper(slug) = $1', forum.toUpperCase());
        })
        .then(function (data) {
          let thr = data.threads;
          thr++;
          return db.none('update forums set (threads) = (' + thr + ') where upper(slug) = $1', forum.toUpperCase())
        })
        .then(function () {
          return db.one('select * from threads where upper(slug) = $1', slug.toUpperCase())
        })
        .then(function (data) {
          if(isEmpty(created)) {
            if(isEmpty(req.body.slug))
            {
              res.status(201)
                .json({
                  author: data.author,
                  forum: forum,
                  id: data.id,
                  message: data.message,
                  title: data.title
                });
            } else {
              res.status(201)
                .json({
                  author: data.author,
                  slug: data.slug,
                  forum: forum,
                  id: data.id,
                  message: data.message,
                  title: data.title
                });
            }
          } else if (isEmpty(req.body.slug)) {
            res.status(201)
              .json({
                author: data.author,
                created: data.created,
                forum: forum,
                id: data.id,
                message: data.message,
                title: data.title
              });
          } else {
            res.status(201)
              .json({
                author: data.author,
                created: data.created,
                slug: data.slug,
                forum: forum,
                id: data.id,
                message: data.message,
                title: data.title
              });
          }
        })
        .catch(function (err) {
          res.status(404).send();
        })
    });
  }
}

const forumController = new ForumController();

module.exports.forumController = forumController;
