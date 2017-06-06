import postService from '../services/postService';
import threadService from '../services/threadService';

class ThreadController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;
      const slugOrId = ctx.params.slug_or_id;

      try {
        const thread = await threadService.findThreadById(slugOrId);
        const id = await postService.dataBase.one(`SELECT nextval('posts_id_seq') as id`);
        const data = postService.getCreateBatch({
          postId: +id.id,
          author: body[0].author,
          created: new Date().toISOString(),
          forum: thread.forum,
          isEdited: body[0].is_edited ? body[0].is_edited : 'FALSE',
          message: body[0].message,
          parent: body[0].parent,
          threadId: thread.id
        });

        console.log(data.query);

        // const result = await data.dataBase.tx(async (transaction) => {
        //   const queries = [];
        //
        //   for (let post of body) {
        //     try {
        //       console.log(+id.id);
        //       console.log(post.author);
        //       console.log(new Date().toISOString());
        //       console.log(thread.forum);
        //       console.log(post.is_edited ? post.is_edited : false);
        //       console.log(post.message);
        //       console.log(post.parent);
        //       console.log(post.parent);
        //       console.log(+id.id);
        //       console.log(thread.id);
        //
        //       queries.push(transaction.none(data.query, [
        //         +id.nextval,
        //         post.author,
        //         new Date().toISOString(),
        //         thread.forum,
        //         post.is_edited ? post.is_edited : false,
        //         post.message,
        //         post.parent,
        //         post.parent,
        //         +id.nextval,
        //         thread.id
        //       ]));
        //     } catch(e) {
        //       console.log(e);
        //     }
        //   }
        //
        //   return await transaction.batch(queries);
        // });

        await postService.updateForums(body.length, thread.forum);
        // console.log(result);

        const result = await postService.dataBase.any(data.query);


        ctx.body = {
          author: result[0].author,
          created: result[0].created,
          forum: result[0].forum,
          id: +result[0].id,
          message: result[0].message,
          thread: result[0].thread
        };
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
