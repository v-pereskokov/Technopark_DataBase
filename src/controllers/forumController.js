import forumService from '../services/forumService';
import userService from '../services/userService';
import threadService from '../services/threadService';
import {isEmpty} from '../tools/isEmpty';

class ForumController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;

      try {
        await forumService.create(body);

        body.user = (await userService.getNickname(body.user)).nickname;

        ctx.body = body;
        ctx.status = 201;

        resolve();
      } catch (e) {
        console.log(e);

        switch (+e.code) {
          case 23502:
            ctx.body = '';
            ctx.status = 404;
            break;
          case 23505:
            ctx.body = await forumService.get(body.slug);
            ctx.status = 409;
            break;
          default:
            break;
        }

        resolve();
      }
    });
  }

  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await forumService.get(ctx.params.slug);
        ctx.body = data;
        ctx.status = data ? 200 : 404;

        resolve();
      } catch(e) {
        ctx.body = 'Not Found';
        ctx.status = 404;

        resolve();
      }
    });
  }

  createThread(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const author = ctx.request.body.author;
      const created = ctx.request.body.created;
      const title = ctx.request.body.title;
      const message = ctx.request.body.message;

      let forum = ctx.request.body.forum;
      let slug = !isEmpty(ctx.request.body.slug) ? ctx.request.body.slug :
        ctx.params.slug;

      try {
        ctx.body = await threadService.create({
          username: author,
          created,
          forum,
          slug,
          message,
          title
        });
        ctx.status = 201;

        resolve();
      } catch(e) {
        console.log(e);
        ctx.body = e;
        ctx.status = 500;
        resolve();
      }
    });
  }
}

const forumController = new ForumController();
export default forumController;
