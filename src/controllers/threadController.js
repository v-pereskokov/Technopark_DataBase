import postService from '../services/postService';
import threadService from '../services/threadService';
import getObjectFromArray from '../tools/getObjectFromArray';

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

class ThreadController {
  async create(ctx, next) {
    // const body = ctx.request.body;
    // const slugOrId = ctx.params.slug_or_id;
    //
    // await threadService.task(async (task) => {
    //   try {
    //     const thread = +slugOrId ? await threadService.findThreadById(+slugOrId, task) :
    //       await threadService.findThreadBySlug(slugOrId, task);
    //     const getPosts = await postService.getPosts(+thread.id, task);
    //
    //     for (let post of body) {
    //       if (post.parent && +post.parent !== 0) {
    //         const parentPost = getObjectFromArray(getPosts, 'id', post.parent);
    //
    //         if (!parentPost || +parentPost.threadid !== +thread.id) {
    //           ctx.body = '';
    //           ctx.status = 409;
    //
    //           return;
    //         }
    //       }
    //     }
    //
    //     ctx.body = (await task.tx(transaction => {
    //       return transaction.batch([
    //         postService.createAsBatch(body, thread, transaction),
    //         postService.updateForums(body.length, thread.forum, transaction)
    //       ]);
    //     }))[0];
    //     ctx.status = 201;
    //   } catch (error) {
    //     ctx.body = null;
    //     ctx.status = 404;
    //   }
    // });

    let slug = ctx.params.slug_or_id;
    let posts = ctx.request.body;
    let forumSlug = 0;
    let threadId = 0;
    let forumId = 0;
    let query = 'threads.id';
    if (!isNumeric(slug)) {
      query = 'threads.slug';
    }

    let created = new Date();
    for (let j = 0; j < posts.length; j++) {
      if (!('parent' in posts[j])) {
        posts[j].parent = 0;
        posts[j].path = [];
      }
      posts[j].created = created;
    }

    try {
      const thread = await threadService.dataBase.one('select threads.id, forums.slug, forums.id as \"forumId\" from threads inner join forums on threads.forum = forums.id ' +
        ' where ' + query + ' = $1', slug);

      forumSlug = thread.slug;
      threadId = thread.id;
      forumId = thread.forumId;

      try {
        const tx1 = await threadService.dataBase.tx(t => {
          let queries = [];
          for (let i = 0; i < posts.length; i += 1) {
            if (posts[i].parent !== 0) {
              let q1 = t.one('select path, id from posts where id = ' + posts[i].parent + ' and thread = ' + threadId);
              queries.push(q1);
            }
          }
          let q2 = t.any('SELECT nextval(\'posts_id_seq\') from generate_series(1, $1)', posts.length);
          queries.push(q2);
          return t.batch(queries);
        });

        let k = 0;
        for (let i = 0; i < posts.length; i += 1) {
          if (posts[i].parent !== 0) {
            posts[i].path = tx1[k].path;
            k += 1;
          }
          posts[i].id = parseInt(tx1[tx1.length - 1][i].nextval);
          posts[i].thread = threadId;
          posts[i].forum = forumSlug;
        }

        try {
          await threadService.dataBase.tx(t => {
            let creat = [];
            let query = ' INSERT INTO posts (id, author, message, parent, thread, forum, created, path) VALUES';
            for (let i = 0; i < posts.length; i += 1) {
              query += ' (' + posts[i].id + ',\'' + posts[i].author + '\',\'' + posts[i].message + '\',' +
                posts[i].parent + ',' + posts[i].thread + ',\'' + posts[i].forum + '\', $' + parseInt(i + 1) + ','
                + ' array_append(ARRAY[';
              if (posts[i].path.length > 0) {
                query += posts[i].path[0];
              }
              for (let j = 1; j < posts[i].path.length; j += 1) {
                query += ',' + posts[i].path[j];
              }
              query += ']::integer[], ' + posts[i].id + '))';
              if (i < posts.length - 1) {
                query += ',';
              }
              creat.push(posts[i].created);
            }
            query += ';';
            query += 'insert into usersForums values';
            for (let i = 0; i < posts.length; i += 1) {
              query += ' (\'' + posts[i].author + '\',' + forumId + ')';
              if (i < posts.length - 1) {
                query += ',';
              }
            }
            let q1 = t.none(query, creat);
            let q2 = t.none('update forums set (posts) = (posts + ' + posts.length + ') where forums.slug = $1', forumSlug);
            return t.batch([q1, q2]);
          });

          let d = JSON.stringify(posts);
          d = JSON.parse(d);
          ctx.body = d;
          ctx.status = 201;
        } catch (error) {
          ctx.body = null;
          ctx.status = 404;
        }
      } catch (error) {
        ctx.body = null;
        ctx.status = 409;
      }


    } catch (error) {
      ctx.body = null;
      ctx.status = 404;
    }
  }

  async createVote(ctx, next) {
    // const slugOrId = ctx.params.slug_or_id;
    // const body = ctx.request.body;
    //
    // const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
    //   await threadService.findThreadBySlug(slugOrId);
    //
    // if (!thread) {
    //   ctx.body = null;
    //   ctx.status = 404;
    //
    //   return;
    // }
    //
    // try {
    //   const votes = await threadService.dataBase.tx(transaction => {
    //     return transaction.batch([
    //       threadService.addVote(body, thread, transaction),
    //       threadService.getVotes(thread.id, transaction)
    //     ]);
    //   });
    //
    //   if (!votes[1]) {
    //     ctx.body = null;
    //     ctx.status = 404;
    //
    //     return;
    //   }
    //
    //   ctx.body = Object.assign(thread, votes[1]);
    //   ctx.status = 200;
    // } catch (error) {
    //   ctx.body = null;
    //   ctx.status = 404;
    // }

    let slug = ctx.params.slug_or_id;
    let slug_or_id = 'threads.id';
    if (!isNumeric(slug)) {
      slug_or_id = 'threads.slug';
    }
    let nickname = ctx.request.body.nickname;
    let voice = ctx.request.body.voice;
    let deltaVoice = 0;
    let threadId = 0;
    let thread;

    return threadService.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.id,' +
      ' threads.message, threads.slug, threads.title, threads.votes from threads inner join forums' +
      ' on (threads.forum=forums.id) where ' + slug_or_id + ' = $1 ', slug)
      .catch(err => {
        ctx.body = null;
        ctx.status = 404;
      })
      .then(data => {
        thread = data;
        threadId = data.id;
        return threadService.dataBase.one('select id, voice from votes where username = $1 and thread = $2', [nickname, threadId]);
      })
      .then(data => {
        deltaVoice = -(data.voice - voice);
        return threadService.dataBase.tx(t => {
          let q1 = t.none('update votes set (voice) = (' + voice + ') where id = $1', data.id);
          let q2 = t.none('update threads set (votes) = (votes + ' + deltaVoice + ') where id = $1', threadId);
          return t.batch([q1, q2]);
        })
          .then(data => {
            let d = JSON.stringify(thread);
            d = JSON.parse(d);
            d.votes += deltaVoice;
            ctx.body = d;
            ctx.status = 200;
          });
      })
      .catch(err => {
        return threadService.dataBase.tx(t => {
          let q1 = t.none('insert into votes (username, voice, thread) values ($1, $2, $3)', [nickname, voice, threadId]);
          let q2 = t.none('update threads set (votes) = (votes + ' + voice + ') where id = $1', threadId);
          return t.batch([q1, q2]);
        })
          .then(data => {
            let d = JSON.stringify(thread);
            d = JSON.parse(d);
            d.votes += voice;
            ctx.body = d;
            ctx.status = 200;
          })
          .catch(err => {
            ctx.body = null;
            ctx.status = 404;
          });
      });
  }

  async getThread(ctx, next) {
    // const slugOrId = ctx.params.slug_or_id;
    //
    // const result = +slugOrId ? await threadService.findThreadById(+slugOrId) :
    //   await threadService.findThreadBySlug(slugOrId);
    //
    // ctx.body = result;
    // ctx.status = result ? 200 : 404;

    let slug = ctx.params.slug_or_id;
    let query = 'threads.id';
    if (!isNumeric(slug)) {
      query = 'threads.slug';
    }

    return threadService.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title, threads.slug, ' +
      ' threads.message, threads.id, threads.votes' +
      ' from threads inner join forums on (threads.forum = forums.id) where ' + query + ' = $1', slug)
      .then(data => {
        let d = JSON.stringify(data);
        d = JSON.parse(d);
        ctx.body = d;
        ctx.status = 200;
      })
      .catch(err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }

  async getPosts(ctx, next) {
    // const slugOrId = ctx.params.slug_or_id;
    // const desc = ctx.query.desc ? ctx.query.desc : 'false';
    // const limit = ctx.query.limit ? +ctx.query.limit : 100;
    // const sort = ctx.query.sort ? ctx.query.sort : 'flat';
    // let marker = ctx.query.marker ? +ctx.query.marker : 0;
    //
    // const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
    //   await threadService.findThreadBySlug(slugOrId);
    //
    // if (!thread) {
    //   ctx.body = null;
    //   ctx.status = 404;
    //
    //   return;
    // }
    //
    // let posts = [];
    //
    // switch (sort) {
    //   case 'flat':
    //     posts = await postService.getPostsFlatSort(+thread.id, desc, limit, marker);
    //     marker += posts.length;
    //     break;
    //   case 'tree':
    //     posts = await postService.getPostsTreeSort(+thread.id, desc, limit, marker);
    //     marker += posts.length;
    //     break;
    //   case 'parent_tree':
    //     posts = await postService.getPostsParentTreeSort(+thread.id, desc, limit, marker);
    //     marker += Math.min(limit, posts.length);
    //     break;
    //   default:
    //     break;
    // }
    //
    // ctx.body = {
    //   marker: `${marker}`,
    //   posts
    // };
    // ctx.status = 200;

    let desc = 'asc';
    if ('desc' in ctx.request.query && ctx.request.query.desc === 'true') {
      desc = 'desc';
    }
    let limit = 0;
    if ('limit' in ctx.request.query) {
      limit = ctx.request.query.limit;
    }
    let marker = 0;
    if ('marker' in ctx.request.query) {
      marker = parseInt(ctx.request.query.marker);
    }
    let sort = 'flat';
    if ('sort' in ctx.request.query && ctx.request.query !== 'flat') {
      sort = ctx.request.query.sort;
    }
    let slug = ctx.params.slug_or_id;
    let str_query = 'threads.id';
    if (!isNumeric(slug)) {
      str_query = 'threads.slug';
    }
    let query;

    return postService.dataBase.one('select * from threads where ' + str_query + ' = $1', slug)
      .then(data => {
        if (sort === 'flat') {
          query = 'SELECT author, created, id, isEdited, message, thread, forum, parent FROM posts WHERE thread = ' + data.id +
            ' ORDER BY created ' + desc + ', id ' + desc + ' LIMIT ' + limit + ' OFFSET ' + marker;
          return postService.dataBase.any(query);
        } else if (sort === 'tree') {
          query = 'SELECT author, created, id, isEdited, message, thread, forum, parent FROM posts WHERE thread = ' + data.id +
            ' ORDER BY path ' + desc + ' LIMIT ' + limit + ' OFFSET ' + marker;
          return postService.dataBase.any(query);
        } else if (sort === 'parent_tree') {
          return postService.dataBase.tx((t) => {
            let query = 'SELECT author, created, id, isEdited, message, thread, ' +
              'forum, parent FROM posts WHERE path[1] in (SELECT id FROM posts WHERE parent = 0 ' +
              'AND thread = ' + data.id + ' ORDER BY id ' + desc + ' LIMIT ' + limit + ' OFFSET ' + marker + ') ' +
              'and thread = ' + data.id + ' ORDER BY path ' + desc + ', id ' + desc;
            let q1 = postService.dataBase.any(query);
            let q2 = postService.dataBase.any('SELECT id FROM posts WHERE parent = 0 AND thread = ' + data.id + ' ORDER BY id ' + desc + ' LIMIT ' + limit + ' OFFSET ' + marker);
            return t.batch([q1, q2]);
          });
        }
      })
      .then(data => {
        let result = 0;
        if (sort === 'flat' || sort === 'tree') {
          marker += data.length;
          result = data;
        } else {
          result = data[0];
          marker += data[1].length;
        }

        ctx.body = {
          marker: String(marker),
          posts: result
        };
        ctx.status = 200;
      })
      .catch(err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }

  async updateThread(ctx, next) {
    // const slugOrId = ctx.params.slug_or_id;
    // const body = ctx.request.body;
    //
    // const thread = +slugOrId ? await threadService.findThreadById(+slugOrId) :
    //   await threadService.findThreadBySlug(slugOrId);
    //
    // if (!thread) {
    //   ctx.body = null;
    //   ctx.status = 404;
    //
    //   return;
    // }
    //
    // await threadService.updateThread(thread, body);
    //
    // ctx.body = Object.assign(thread, body);
    // ctx.status = 200;

    let slug = ctx.params.slug_or_id;
    let query = 'threads.id';
    if (!isNumeric(slug)) {
      query = 'threads.slug';
    }

    return threadService.dataBase.one('select * from threads where ' + query + ' = $1', slug)
      .then(data => {
        return threadService.dataBase.tx((t) => {
          let q1 = t.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
            ' threads.slug, threads.message, threads.id from threads inner join forums' +
            ' on (threads.forum=forums.id) where ' + query + ' = $1', slug);
          if (!isEmpty(ctx.request.body.title) && !isEmpty(ctx.request.body.message)) {
            q1 = t.none('update threads set (title, message) = (\'' + ctx.request.body.title + '\',' +
              '\'' + ctx.request.body.message + '\') where ' + query + ' = $1', slug);
          } else if (!isEmpty(ctx.request.body.title)) {
            q1 = t.none('update threads set (title) = (\'' + ctx.request.body.title + '\') where ' + query + ' = $1', slug);
          } else if (!isEmpty(ctx.request.body.message)) {
            q1 = t.none('update threads set (message) = (\'' + ctx.request.body.message + '\') where ' + query + ' = $1', slug);
          }
          let q2 = t.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
            ' threads.slug, threads.message, threads.id from threads inner join forums' +
            ' on (threads.forum=forums.id) where ' + query + ' = $1', slug);
          return t.batch([q1, q2]);
        });
      })
      .then(data => {
        let d = JSON.stringify(data[1]);
        d = JSON.parse(d);
        ctx.body = d;
        ctx.status = 200;
      })
      .catch(err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }
}

const threadController = new ThreadController();
export default threadController;
