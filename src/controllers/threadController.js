import postService from '../services/postService';
import threadService from '../services/threadService';
import isEmptyObject from '../tools/isEmptyObject';

class ThreadController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const body = ctx.request.body;
      const slugOrId = ctx.params.slug_or_id;

      try {
        const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
          await threadService.findThreadBySlug(slugOrId);

        const posts = [];

        for (let post of body) {
          posts.push(Object.assign(post, {
            parent: post.parent ? +post.parent : 0,
          }, {
            thread: +thread.id,
            forum: thread.forum
          }));
        }

      // .then(data => {
      //     dataForum = data.forum;
      //
      //     for (let key in body) {
      //       arr.push({
      //         author: body[key].author,
      //         isEdited: body[key].isEdited,
      //         message: body[key].message,
      //         parent: body[key].parent ? body[key].parent : 0,
      //         thread: data.id,
      //         forum: dataForum
      //       });
      //     }
      //     return dataBase.dataBase.any('select * from posts where posts.thread = $1', data.id);
      //   })
      //     .then(data => {
      //       let check = 0;
      //
      //       for (let j = 0; j < arr.length; j++) {
      //         if (arr[j].parent === 0) {
      //           ++check;
      //         } else {
      //           if (!isEmpty(data)) {
      //             for (let i = 0; i < data.length; i++) {
      //               if (arr[j].parent === data[i].id) {
      //                 ++check;
      //               }
      //             }
      //           }
      //         }
      //       }
      //       if (check === num_post) {
      //         return dataBase.dataBase.tx(t => {
      //           let queries = arr.map(l => {
      //             return t.one('INSERT INTO posts (author, isEdited, message, parent, thread, forum) ' +
      //               'VALUES(${author}, ${isEdited}, ${message}, ${parent}, ${thread}, ${forum}) returning id;', l);
      //           });
      //           return t.batch(queries);
      //         });
      //       } else {
      //         ctx.status = 409;
      //         resolve();
      //       }
      //     })

        let check = 0;
        const postsFromDB = await postService.getPosts(thread.id);

        console.log('pdb\n');
        console.log(postsFromDB);

        for (let post of posts) {
          if (post.parent === 0) {
            console.log('parent is nil');
            ++check;
          } else {
            console.log('parent is not nil');
            if (!isEmptyObject(postsFromDB)) {
              console.log('parent is nil and obj not nul');
              for (let postFromDB of postsFromDB) {
                if (post.parent === postFromDB.id) {
                  ++check;
                }
              }
            }
          }
        }

        console.log('last check\n');
        console.log(check);
        console.log(body.length);
        console.log('end of last check\n');

        const result = await postService.createAsBatch(body, thread);
        await postService.updateForums(body.length, thread.forum);

        if (result[0][0].path && result[0][0].path.length > 1) {
          ctx.body = '';
          ctx.status = 409;
        } else {
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
        }

        resolve();
      } catch (e) {
        console.log(e);

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
      const desc = ctx.query.desc ? ctx.query.desc : 'false';
      const limit = ctx.query.limit ? +ctx.query.limit : 100;
      const sort = ctx.query.sort ? ctx.query.sort : 'flat';
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

      const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
        await threadService.findThreadBySlug(slugOrId);

      try {
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
