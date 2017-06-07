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

        const returned = [];

        for (let post of result) {
          for (let postDetails of post) {
            returned.push(Object.assign(postDetails, {
              parent: +postDetails.parent,
              thread: +postDetails.threadid,
              id: +postDetails.id
            }));
          }
        }

        ctx.body = returned;
        ctx.status = 201;

        resolve();
      } catch (e) {
        ctx.body = e;
        ctx.status = 404;
        resolve();
      }
    });
  }

  createVote(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const slugOrId = ctx.params.slug_or_id;
      const body = ctx.request.body;

      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);
      await threadService.addVote(body, thread);

      const votes = await threadService.getVotes(thread.id);

      ctx.body = Object.assign(thread, votes, {
        id: +thread.id
      });
      ctx.status = 200;

      resolve();
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
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const sort = ctx.query.sort;
      let marker = ctx.query.marker ? +ctx.query.marker : 0;

      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);

      let posts = [];

      try {
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
          }))
        }

        ctx.body = {
          marker: `${marker}`,
          posts: result
        };
        ctx.status = 200;

        resolve();
      } catch(e) {
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
