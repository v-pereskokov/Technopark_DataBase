import postService from '../services/postService';
import userService from '../services/userService';
import forumService from '../services/forumService';
import threadService from '../services/threadService';

class PostController {
  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const id = ctx.params.id;
      const related = ctx.request.query.related;

      try {
        let post = await postService.getPostById(id);
        post = Object.assign(post, {
          id: +post.id,
          isEdited: post.isedited,
          thread: +post.threadid
        });

        let response = {
          post
        };

        if (related) {
          if (related.indexOf('user') !== -1) {
            const user = await userService.getUserByNickname(post.author);
            response['author'] = Object.assign(user, {
              id: +user.id
            });
          }

          if (related.indexOf('forum') !== -1) {
            const forum = await forumService.get(post.forum);
            response['forum'] = Object.assign(forum, {
              id: +forum.id,
              posts: +forum.posts,
              threads: +forum.threads
            });
          }

          if (related.indexOf('thread') !== -1) {
            const thread = await threadService.findThreadById(+post.thread);
            response['thread'] = Object.assign(thread, {
              id: +thread.id,
              votes: +thread.votes
            });
          }
        }

        ctx.body = response;
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
