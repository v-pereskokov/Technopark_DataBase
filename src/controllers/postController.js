import postService from '../services/postService';

class PostController {
  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const id = ctx.params.id;
      const related = ctx.request.query.related;

      try {
        const post = await postService.getPostById(id);

        if (related) {
        }

        ctx.body = {
          post: Object.assign(post, {
            id: +post.id,
            isEdited: post.isedited,
            thread: +post.threadid
          })
        };
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = '';
        ctx.status = 404;

        resolve();
      }
    });
  }

  update(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const id = ctx.params.id;
      const message = ctx.request.body.message;

      try {
        const post = await postService.getPostById(id);

        Object.assign(post, {
          message: message ? message : post.message,
          isedited: message && post.message !== message,
          id: +post.id,
          thread: +post.threadid,
        });

        await postService.updatePost(post);

        ctx.body = Object.assign(post, {
          isEdited: post.isedited
        });
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = '';
        ctx.status = 404;

        resolve();
      }
    });
  }
}

const postController = new PostController();
export default postController;
