import postService from '../services/postService';
import userService from '../services/userService';
import forumService from '../services/forumService';
import threadService from '../services/threadService';

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

class PostController {
  async get(ctx, next) {
    const id = ctx.params.id;
    const related = ctx.request.query.related;
    let response = {};

    const post = await postService.getPost(id);

    if (!post) {
      ctx.body = null;
      ctx.status = 404;

      return;
    }

    response['post'] = post;

    let checker = {
      user: -1,
      thread: -1,
      forum: -1
    };

    const posts = await postService.transaction(transaction => {
      const queries = [];
      let index = 0;

      if (related) {
        if (related.indexOf('user') !== -1) {
          queries.push(userService.getUserByNicknameNL(post.author, transaction));

          checker.user = index;
          ++index;
        }

        if (related.indexOf('thread') !== -1) {
          queries.push(threadService.getThread(post.thread, transaction));

          checker.thread = index;
          ++index;
        }

        if (related.indexOf('forum') !== -1) {
          queries.push(forumService.getBySlug(post.forum, transaction));

          checker.forum = index;
          ++index;
        }
      }

      return transaction.batch(queries);
    });

    if (checker.user !== -1) {
      response.author = posts[checker.user];
    }

    if (checker.thread !== -1) {
      response.thread = posts[checker.thread];
    }

    if (checker.forum !== -1) {
      response.forum = posts[checker.forum];
    }

    ctx.body = response;
    ctx.status = 200;
  }

  async update(ctx, next) {
    let id = ctx.params.id;
    let message = ctx.request.body.message;

    try {
      const posts = await postService.getPost(id);

      if (message && message !== posts.message) {
        try {
          ctx.body = (await postService.transaction(transaction => {
            const update = postService.update(id, message, transaction);
            const select = postService.getPostOne(id, transaction);

            return transaction.batch([update, select]);
          }))[1];
          ctx.status = 200;
        } catch (error) {
          ctx.body = null;
          ctx.status = 404;
        }
      } else {
        ctx.body = posts;
        ctx.status = 200;
      }
    } catch (error) {
      ctx.body = null;
      ctx.status = 404;
    }
  }
}

const postController = new PostController();
export default postController;
