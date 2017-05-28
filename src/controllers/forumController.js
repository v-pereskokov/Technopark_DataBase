import forumService from '../services/forumService';
import userService from '../services/userService';

class ForumController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;
      try {
        await forumService.create(body);

        //set user?
        ctx.body = body;
        ctx.status = 201;

        resolve();
      } catch (e) {
        ctx.body = e;
        ctx.status = 500;

        resolve();
      }
    });
  }

  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      try {
        ctx.body = await forumService.get(ctx.params.slug);
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = 'Not Found';
        ctx.status = 404;

        resolve();
      }
    });
  }
}

const forumController = new ForumController();
export default forumController;
