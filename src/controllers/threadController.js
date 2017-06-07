import postService from '../services/postService';
import threadService from '../services/threadService';

class ThreadController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;
      const slugOrId = ctx.params.slug_or_id;

      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);

        const result = await postService.createAsBatch(body, thread);
        await postService.updateForums(body.length, thread.forum);

        const returned = [];

        for (let post of result) {
          for (let postDetails of post) {
            returned.push(Object.assign(postDetails, {
              thread: +postDetails.threadid,
              id: +postDetails.id
            }));
          }
        }

        ctx.body = returned;
        ctx.status = 201;

        resolve();
      } catch (e) {
        ctx.body = e;
        ctx.status = 404;
        resolve();
      }
    });
  }

  createVote(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;
      const body = ctx.request.body;

      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);
      await threadService.addVote(body, thread);

      const votes = await threadService.getVotes(thread.id);

      ctx.body = Object.assign(thread, votes, {
        id: +thread.id
      });
      ctx.status = 200;

      resolve();
    });
  }

  getThread(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;

      try {
        const result = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);

        ctx.body = Object.assign(result, {
          id: +result.id
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

const threadController = new ThreadController();
export default threadController;
