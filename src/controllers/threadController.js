import Promise from 'bluebird';
import postService from '../services/postService';
import threadService from '../services/threadService';
import getObjectFromArray from '../tools/getObjectFromArray';

class ThreadController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;
      const slugOrId = ctx.params.slug_or_id;

      threadService.task(async (task) => {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId, task) :
          await threadService.findThreadBySlug(slugOrId, task);

        try {
          const getPosts = await postService.getPosts(+thread.id, task);

          for (let post of body) {
            if (post.parent && +post.parent !== 0) {
              const parentPost = getObjectFromArray(getPosts, 'id', post.parent);

              if (!parentPost || +parentPost.threadid !== +thread.id) {
                ctx.body = '';
                ctx.status = 409;

                resolve();

                return;
              }
            }
          }

          const result = await postService.createAsBatch(body, thread, task);
          await postService.updateForums(body.length, thread.forum);

          ctx.body = result;
          ctx.status = 201;

          resolve();
        } catch (error) {
          ctx.body = null;
          ctx.status = 404;

          resolve();
        }
      });
    });
  }

  createVote(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;
      const body = ctx.request.body;

      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);
        await threadService.addVote(body, thread);

        const votes = await threadService.getVotes(thread.id);

        ctx.body = Object.assign(thread, votes, {
          id: +thread.id
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

  getPosts(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;
      const desc = ctx.query.desc ? ctx.query.desc : 'false';
      const limit = ctx.query.limit ? +ctx.query.limit : 100;
      const sort = ctx.query.sort ? ctx.query.sort : 'flat';
      let marker = ctx.query.marker ? +ctx.query.marker : 0;

      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);

        let posts = [];

        switch (sort) {
          case 'flat':
            posts = await postService.getPostsFlatSort(+thread.id, desc, limit, marker);
            marker += posts.length;
            break;
          case 'tree':
            posts = await postService.getPostsTreeSort(+thread.id, desc, limit, marker);
            marker += posts.length;
            break;
          case 'parent_tree':
            posts = await postService.getPostsParentTreeSort(+thread.id, desc, limit, marker);
            marker += Math.min(limit, posts.length);
            break;
          default:
            break;
        }

        const result = [];

        for (let post of posts) {
          result.push(Object.assign(post, {
            id: +post.id,
            thread: +post.threadid,
            parent: post.parent ? +post.parent : null
          }));
        }

        ctx.body = {
          marker: `${marker}`,
          posts: result
        };
        ctx.status = 200;

        resolve();
      } catch (e) {
        ctx.body = '';
        ctx.status = 404;

        resolve();
      }
    });
  }

  updateThread(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;
      const body = ctx.request.body;

      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);
        await threadService.updateThread(thread, ctx.request.body);

        ctx.body = Object.assign(thread, body, {
          id: +thread.id
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
