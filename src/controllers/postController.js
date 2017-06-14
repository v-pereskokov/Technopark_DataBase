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
    // const message = ctx.request.body.message;
    //
    // // union
    // const post = await postService.getPostById(ctx.params.id);
    //
    // if (!post) {
    //   ctx.body = null;
    //   ctx.status = 404;
    //
    //   return;
    // }
    //
    // post.isEdited = message && post.message !== message;
    // post.message = message || post.message;
    // post.thread = +post.threadid;
    //
    // await postService.updatePost(post);
    //
    // ctx.body = post;
    // ctx.status = 200;

    let id = ctx.params.id;
    let message = ctx.request.body.message;

    try {
      const posts = await postService.dataBase.one('select isEdited as \"isEdited\", author, created, forum, id, thread, message from posts where id = $1', id);

      if (!isEmpty(message) && (message !== posts.message)) {
        try {
          const data = await postService.dataBase.tx(t => {
            let q1 = t.none('update posts set (message, isEdited) = (\'' + message + '\', true) where id = $1', id);
            let q2 = t.one('select isEdited as \"isEdited\", author, created, forum, id, thread, message from posts where id = $1', id);
            return t.batch([q1, q2]);
          });

          let d = JSON.stringify(data[1]);
          d = JSON.parse(d);
          ctx.body = d;
          ctx.status = 200;
        } catch (error) {
          ctx.body = null;
          ctx.status = 404;
        }
      } else {
        let d = JSON.stringify(posts);
        d = JSON.parse(d);
        ctx.body = d;
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
