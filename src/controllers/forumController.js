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
        switch (+e.code) {
          case 23502:
            ctx.body = e;
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

  createThread(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const username = ctx.request.body.author;
      const created = ctx.request.body.created;
      const title = ctx.request.body.title;
      const message = ctx.request.body.message;

      let forum = ctx.request.body.forum;
      let slug = !isEmpty(ctx.request.body.slug) ? ctx.request.body.slug :
        ctx.params.slug;

      try {
        const result = await threadService.create({
          username,
          created,
          forum,
          slug,
          message,
          title
        });

        ctx.body = {
          id: +result.id,
          author: result.author,
          created: result.created,
          forum: result.forum,
          message: result.message,
          slug: result.slug === result.forum ? '' : result.slug,
          title: result.title,
          votes: +result.votes
        };
        ctx.status = 201;

        resolve();
      } catch(e) {
        try {
          const conflict = await threadService.findThreadBySlug(slug);

          ctx.body = Object.assign(conflict, {
            id: +conflict.id
          });
          ctx.status = 409;
        } catch(e) {
          ctx.body = '';
          ctx.status = 404;
        }

        resolve();
      }
    });
  }

  getThreads(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      try {
        const slugs = await forumService.getSlug(slug);
        const result = await threadService.getForumThreads(slugs.slug, limit, since, desc);
        const top = [];

        if (result) {
          for (let thread of result) {
            top.push({
              id: +thread.id,
              slug: thread.slug,
              author: thread.author,
              forum: thread.forum,
              created: thread.created,
              message: thread.message,
              title: thread.title,
              votes: +thread.votes
            });
          }
        }

        ctx.body = top;
        ctx.status = 200;
      } catch(e) {
        if (e.query.indexOf('ORDER BY') !== -1) {
          ctx.body = [];
          ctx.status = 200;
        } else {
          ctx.body = '';
          ctx.status = 404;
        }
      }

      resolve();
    });
  }
}

const forumController = new ForumController();
export default forumController;
