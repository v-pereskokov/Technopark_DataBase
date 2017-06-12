import forumService from '../services/forumService';
import userService from '../services/userService';
import threadService from '../services/threadService';
import {isEmpty} from '../tools/isEmpty';

class ForumController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
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
    return new Promise(async (resolve, reject) => {
      const username = ctx.request.body.author;
      const created = ctx.request.body.created;
      const title = ctx.request.body.title;
      const message = ctx.request.body.message;

      const slug = !isEmpty(ctx.request.body.slug) ? ctx.request.body.slug :
        ctx.params.slug;
      const forum = ctx.request.body.forum ? ctx.request.body.forum : slug;

      try {
        const result = await threadService.create({
          username,
          created,
          forum,
          slug,
          message,
          title
        });

        await forumService.updateForums(forum);

        ctx.body = Object.assign(result, {
          id: +result.id,
          slug: result.slug === result.forum ? '' : result.slug,
          votes: +result.votes
        });
        ctx.status = 201;

        resolve();
      } catch (e) {
        try {
          const conflict = await threadService.findThreadBySlug(slug);

          ctx.body = Object.assign(conflict, {
            id: +conflict.id
          });
          ctx.status = 409;
        } catch (e) {
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
            top.push(Object.assign(thread, {
              id: +thread.id,
              votes: +thread.votes
            }));
          }
        }

        ctx.body = top;
        ctx.status = 200;
      } catch (e) {
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

  getUsers(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const desc = ctx.query.desc ? ctx.query.desc : 'false';
      const limit = ctx.query.limit ? +ctx.query.limit : 100;
      const since = ctx.query.since;
      const slug = ctx.params.slug;

      try {
        const id = await forumService.getId(slug);

        ctx.body = await userService.getForumMembers({
          id: +id.id,
          limit,
          since,
          desc
        });
        ctx.status = 200;

        resolve();
      } catch (e) {
        ctx.body = '';
        ctx.status = 404;

        resolve();
      }
    });
  }
}

const forumController = new ForumController();
export default forumController;
