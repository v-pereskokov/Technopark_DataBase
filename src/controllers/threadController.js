import postService from '../services/postService';
import threadService from '../services/threadService';
import getObjectFromArray from '../tools/getObjectFromArray';

class ThreadController {
  async create(ctx, next) {
    const body = ctx.request.body;
    const slugOrId = ctx.params.slug_or_id;

    await threadService.task(async (task) => {
      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId, task) :
          await threadService.findThreadBySlug(slugOrId, task);
        const getPosts = await postService.getPosts(+thread.id, task);

        for (let post of body) {
          if (post.parent && +post.parent !== 0) {
            const parentPost = getObjectFromArray(getPosts, 'id', post.parent);

            if (!parentPost || +parentPost.threadid !== +thread.id) {
              ctx.body = '';
              ctx.status = 409;

              return;
            }
          }
        }

        ctx.body = (await task.tx(transaction => {
          return transaction.batch([
            postService.createAsBatch(body, thread, transaction),
            postService.updateForums(body.length, thread.forum, transaction)
          ]);
        }))[0];
        ctx.status = 201;
      } catch (error) {
        ctx.body = null;
        ctx.status = 404;
      }
    });
  }

  async createVote(ctx, next) {
    const slugOrId = ctx.params.slug_or_id;
    const body = ctx.request.body;

    const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
      await threadService.findThreadBySlug(slugOrId);

    if (!thread) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    try {
      const votes = await threadService.dataBase.tx(transaction => {
        return transaction.batch([
          threadService.addVote(body, thread, transaction),
          threadService.getVotes(thread.id, transaction)
        ]);
      });

      if (!votes[1]) {
        ctx.body = null;
        ctx.status = 404;

        return;
      }

      ctx.body = Object.assign(thread, votes[1]);
      ctx.status = 200;
    } catch (error) {
      ctx.body = null;
      ctx.status = 404;
    }
  }

  async getThread(ctx, next) {
    const slugOrId = ctx.params.slug_or_id;

    const result = +slugOrId ? await threadService.findThreadById(+slugOrId) :
      await threadService.findThreadBySlug(slugOrId);

    ctx.body = result;
    ctx.status = result ? 200 : 404;
  }

  async getPosts(ctx, next) {
    const slugOrId = ctx.params.slug_or_id;
    const desc = ctx.query.desc ? ctx.query.desc : 'false';
    const limit = ctx.query.limit ? +ctx.query.limit : 100;
    const sort = ctx.query.sort ? ctx.query.sort : 'flat';
    let marker = ctx.query.marker ? +ctx.query.marker : 0;

    try {
      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);

      let posts = [];

      switch (sort) {
        case 'flat':
          posts = await postService.getPostsFlatSort(+thread.id, desc, limit, marker);
          marker += posts.length;
          break;
        case 'tree':
          posts = await postService.getPostsTreeSort(+thread.id, desc, limit, marker);
          marker += posts.length;
          break;
        case 'parent_tree':
          posts = await postService.getPostsParentTreeSort(+thread.id, desc, limit, marker);
          marker += Math.min(limit, posts.length);
          break;
        default:
          break;
      }

      const result = [];

      for (let post of posts) {
        result.push(Object.assign(post, {
          id: +post.id,
          thread: +post.threadid,
          parent: post.parent ? +post.parent : null
        }));
      }

      ctx.body = {
        marker: `${marker}`,
        posts: result
      };
      ctx.status = 200;
    } catch (e) {
      ctx.body = '';
      ctx.status = 404;
    }
  }

  async updateThread(ctx, next) {
    const slugOrId = ctx.params.slug_or_id;
    const body = ctx.request.body;

    try {
      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);
      await threadService.updateThread(thread, ctx.request.body);

      ctx.body = Object.assign(thread, body, {
        id: +thread.id
      });
      ctx.status = 200;
    } catch (e) {
      ctx.body = '';
      ctx.status = 404;
    }
  }
}

const threadController = new ThreadController();
export default threadController;
