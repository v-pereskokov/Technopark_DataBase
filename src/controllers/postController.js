import postService from '../services/postService';

class PostController {
  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const id = ctx.params.id;
      const related = ctx.request.query.related;

      try {
        const post = await postService.getPostById(id);

        ctx.body = '';
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = 'Not Found!';
        ctx.status = 404;

        resolve();
      }
    });
  }
}

const postController = new PostController();
export default postController;
