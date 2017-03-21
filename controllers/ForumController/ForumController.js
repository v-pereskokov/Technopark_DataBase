const userService = require('../../services/UserService/UserService');
const forumService = require('../../services/ForumService/ForumService');
const threadService = require('../../services/ThreadService/ThreadService');

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
          return forumService.forumService.getForumBySlug(forum)
        })
        .then(data => {
          forum = data.slug;

          return threadService.threadService.create({
            author: author,
            forum: data.id,
            message: message,
            title: title,
            created: isEmpty(created) ? created : null,
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
          return forumService.forumService.updateFields('threads', `\'${++(data.threads)}\'`, {
            name: 'slug',
            value: forum
          });
        })
        .then(() => {
          return threadService.threadService.getThreadBySlug(slug, true);
        })
        .then(function (data) {
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
        .catch(function (err) {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        })
    });
  }
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

const forumController = new ForumController();

module.exports.forumController = forumController;
