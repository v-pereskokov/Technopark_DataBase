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

        for (let post of result[0]) {
          Object.assign(post, {
            thread: +post.thread_id,
            id: +post.id
          })
        }

        ctx.body = result[0];
        ctx.status = 201;

        resolve();
      } catch (e) {
        console.log(e);

        ctx.body = e;
        ctx.status = 404;
        resolve();
      }
    });
  }
}

const threadController = new ThreadController();
export default threadController;
