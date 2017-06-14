import forumService from '../services/forumService';
import userService from '../services/userService';
import threadService from '../services/threadService';

class ForumController {
  async create(ctx, next) {
    const body = ctx.request.body;

    const user = await userService.getUserNickname(body.user);

    if (!user) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    const forum = await forumService.get(user.nickname, body.slug);

    if (forum) {
      ctx.body = forum;
      ctx.status = 409;

      return;
    }

    // mb union and without tx

    const insertForum = await userService.transaction(transaction => {
      const insert = forumService.create(user.nickname, body, transaction);
      const select = forumService.get(user.nickname, body.slug, transaction);

      return transaction.batch([insert, select]);
    });

    ctx.body = insertForum[1];
    ctx.status = 201;
  }

  async get(ctx, next) {
    const forum = await forumService.getBySlug(ctx.params.slug);

    if (!forum) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    ctx.body = forum;
    ctx.status = forum ? 200 : 404;
  }

  async createThread(ctx, next) {
    const author = ctx.request.body.author;
    const created = ctx.request.body.created;
    const message = ctx.request.body.message;
    const title = ctx.request.body.title;
    const slugThread = ctx.request.body.slug;
    const slug = ctx.params.slug;

    const select = await forumService.transaction(transaction => {
      const forum = forumService.getId(slug, transaction);
      const user = userService.getUserNickname(author, transaction);

      return transaction.batch([forum, user]);
    });

    if (!select[0] || !select[1]) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    const id = select[0].id;
    const user = select[1].nickname;

    const thread = await forumService.getThread(slugThread);

    if (thread) {
      ctx.body = thread;
      ctx.status = 409;

      return;
    }

    const createThread = await forumService.transaction(transaction => {
      const thread = threadService.create({
        slugThread, created, user, id, message, title
      }, transaction);
      const updateForums = forumService.updateForums(id, transaction);
      const insertUF = forumService.insertUF({
        user, id
      }, transaction);

      return transaction.batch([thread, updateForums, insertUF]);
    });

    ctx.body = await forumService.getThreadById(createThread[0].id);
    ctx.status = 201;
  }

  async getThreads(ctx, next) {
    const slug = ctx.params.slug;
    const desc = ctx.query.desc;
    const limit = ctx.query.limit;
    const since = ctx.query.since;

    const forum = await forumService.getAllForum(slug);

    if (!forum) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    ctx.body = await threadService.getSortedThreads(forum.id, desc, since, limit);
    ctx.status = 200;
  }

  async getUsers(ctx, next) {
    const desc = ctx.query.desc ? ctx.query.desc : 'false';
    const limit = +ctx.query.limit || 0;
    const since = ctx.query.since;
    const slug = ctx.params.slug;

    const id = await forumService.getForumId(slug);

    if (!id) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    ctx.body = await threadService.getSortedUsers(id.id, desc, since, limit);
    ctx.status = 200;
  }
}

const forumController = new ForumController();
export default forumController;
