import forumService from '../services/forumService';
import userService from '../services/userService';
import threadService from '../services/threadService';

class ForumController {
  async create(ctx, next) {
    const body = ctx.request.body;

    await forumService.task(async (task) => {
      const author = await forumService.checkAuthor(body.user, task);

      if (!author) {
        ctx.body = null;
        ctx.status = 404;

        return;
      }

      try {
        ctx.body = await forumService.create({
          slug: body.slug,
          title: body.title,
          user: author.nickname
        }, task);
        ctx.status = 201;
      } catch (error) {
        ctx.body = await forumService.get(body.slug, task);
        ctx.status = 409;
      }
    });
  }

  async get(ctx, next) {
    const result = await forumService.get(ctx.params.slug);

    ctx.body = result;
    ctx.status = result ? 200 : 404;
  }

  async createThread(ctx, next) {
    const slug = ctx.request.body.slug || ctx.params.slug;
    const forum = ctx.request.body.forum || slug;

    await forumService.task(async (task) => {
      try {
        const result = (await task.tx(transaction => {
          return transaction.batch([
            threadService.create(ctx.request.body, slug, forum, transaction),
            forumService.updateForums(forum, transaction)
          ]);
        }))[0];

        ctx.body = Object.assign(result, {
          slug: result.slug === result.forum ? '' : result.slug,
        });
        ctx.status = 201;
      } catch(e) {
        const isConflict = await threadService.findThreadBySlug(slug, task);

        ctx.body = isConflict;
        ctx.status = isConflict ? 409 : 404;
      }
    });
  }

  async getThreads(ctx, next) {
    const desc = ctx.query.desc;
    const limit = ctx.query.limit;
    const since = ctx.query.since;
    const slug = ctx.params.slug;

    await forumService.task(async (task) => {
      const slugs = await forumService.getSlug(slug, task);
      if (!slugs) {
        ctx.body = null;
        ctx.status = 404;

        return;
      }

      ctx.body = await threadService.getForumThreads(slugs.slug, limit, since, desc, task);
      ctx.status = 200;
    });
  }

  async getUsers(ctx, next) {
    const desc = ctx.query.desc ? ctx.query.desc : 'false';
    const limit = ctx.query.limit ? +ctx.query.limit : 100;
    const since = ctx.query.since;
    const slug = ctx.params.slug;

    const id = await forumService.getId(slug);

    if (!id) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    ctx.body = await userService.getForumMembers({
      id: +id.id,
      limit,
      since,
      desc
    });
    ctx.status = 200;
  }
}

const forumController = new ForumController();
export default forumController;
