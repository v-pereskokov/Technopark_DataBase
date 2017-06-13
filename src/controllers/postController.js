import postService from '../services/postService';
import userService from '../services/userService';
import forumService from '../services/forumService';
import threadService from '../services/threadService';

class PostController {
  async get(ctx, next) {
    const id = ctx.params.id;
    const related = ctx.request.query.related;

    let post = await postService.getPostById(id);

    if (!post) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    post.thread = +post.threadid;

    let response = {post};

    if (related) {
      if (related.indexOf('user') !== -1) {
        response['author'] = await userService.getUserByNickname(post.author);
      }

      if (related.indexOf('forum') !== -1) {
        response['forum'] = await forumService.get(post.forum);
      }

      if (related.indexOf('thread') !== -1) {
        response['thread'] = await threadService.findThreadById(+post.thread);
      }
    }

    ctx.body = response;
    ctx.status = 200;
  }

  async update(ctx, next) {
    const message = ctx.request.body.message;

    // union
    const post = await postService.getPostById(ctx.params.id);

    if (!post) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    post.isEdited = message && post.message !== message;
    post.message = message || post.message;
    post.thread = +post.threadid;

    await postService.updatePost(post);

    ctx.body = post;
    ctx.status = 200;
  }
}

const postController = new PostController();
export default postController;
