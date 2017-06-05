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
        const data = postService.getCreateBatch();

        const result = await data.dataBase.tx(async (transaction) => {
          const queries = [];

          for (let post of body) {
            const id = await data.dataBase.one(`SELECT nextval('posts_id_seq')`);

            queries.push(transaction.none(data.query, [
              id,
              post.author,
              new Date().toISOString(),
              thread.forum,
              post.is_edited ? post.is_edited : false,
              post.message,
              post.parent,
              post.parent,
              id,
              thread.id
            ]));
          }

          return await transaction.batch(queries);
        });

        await postService.updateForums(body.length, thread.forum);

        ctx.body = body;
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
