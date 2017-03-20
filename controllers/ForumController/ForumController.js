const forumService = require('../../services/ForumService/ForumService');
const userService = require('../../services/UserService/UserService');

class ForumController {
  constructor() {

  }

  create(ctx, next) {
    return new Promise(resolve => {
      let body = ctx.request.body;

      forumService.forumService.createForum({
        slug: body.slug,
        title: body.title,
        username: body.user
      })
        .then(data => {
          ctx.body = body;
          ctx.status = 201;
          resolve();
        })
        .catch(error => {
          ctx.body = error;
          ctx.status = 201;
          resolve();
        })
    });
  }
}

const forumController = new ForumController();

module.exports.forumController = forumController;
