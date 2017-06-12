import forumService from '../services/forumService';
import userService from '../services/userService';
import threadService from '../services/threadService';
import {isEmpty} from '../tools/isEmpty';

class ForumController {
  create(ctx, next) {
    return new Promise((resolve, reject) => {
      const body = ctx.request.body;


      forumService.task(async (task) => {
        const author = await forumService.checkAuthor(body.user, task);

        if (!author) {
          ctx.body = null;
          ctx.status = 404;

          resolve();
          return;
        }

        const data = await forumService.create({
          slug: body.slug,
          title: body.title,
          nickname: author.nickname
        }, task);

        ctx.body = data;
        ctx.status = data.action === 'updated' ? 409 : 201;

        resolve();
      });
    });
  }

  get(ctx, next) {
    return new Promise(async (resolve, reject) => {

      const result = await forumService.get(ctx.params.slug);

      ctx.body = result;
      ctx.status = result ? 200 : 404;

      resolve();
    });
  }

  createThread(ctx, next) {
    return new Promise((resolve, reject) => {
      const username = ctx.request.body.author;
      const created = ctx.request.body.created;
      const title = ctx.request.body.title;
      const message = ctx.request.body.message;
      const slug = ctx.request.body.slug || ctx.params.slug;
      const forum = ctx.request.body.forum || slug;

      forumService.task(async (task) => {
        const thread = await threadService.findThreadBySlug(slug, task);

        if (thread) {
          ctx.body = thread;
          ctx.status = 409;

          resolve();
          return;
        }

        // delete try
        try {
          const result = await threadService.create({
            username,
            created,
            forum,
            slug,
            message,
            title
          }, task);

          await forumService.updateForums(forum, task);

          ctx.body = Object.assign(result, {
            slug: result.slug === result.forum ? '' : result.slug
          });
          ctx.status = 201;
        } catch (error) {
          ctx.body = null;
          ctx.status = 404;
        }

        resolve();
      });
    });
  }

  getThreads(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      forumService.task(async (task) => {
        const slugs = await forumService.getSlug(slug, task);
        if (!slugs) {
          ctx.body = null;
          ctx.status = 404;

          resolve();
          return;
        }

        ctx.body = await threadService.getForumThreads(slugs.slug, limit, since, desc, task);
        ctx.status = 200;

        resolve();
      });
    });
  }

  getUsers(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const desc = ctx.query.desc ? ctx.query.desc : 'false';
      const limit = ctx.query.limit ? +ctx.query.limit : 100;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      const id = await forumService.getId(slug);

      if (!id) {
        ctx.body = null;
        ctx.status = 404;

        resolve();
        return;
      }

      ctx.body = await userService.getForumMembers({
        id: +id.id,
        limit,
        since,
        desc
      });
      ctx.status = 200;

      resolve();
    });
  }
}

const forumController = new ForumController();
export default forumController;
