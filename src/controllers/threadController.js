import postService from '../services/postService';
import threadService from '../services/threadService';
import forumService from '../services/forumService';
import makeInsertPostsQuery from '../tools/makeInsertPostsQuery';

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
            const request = makeInsertPostsQuery(posts, forumId);
            let q1 = t.none(request.query, request.create);
            let q2 = t.none('update forums set (posts) = (posts + ' + posts.length + ') where forums.slug = $1', forumSlug);
            return t.batch([q1, q2]);
          });

          ctx.body = posts;
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

    // let slug = ctx.params.slug_or_id;
    // let slug_or_id = 'threads.id';
    // if (!isNumeric(slug)) {
    //   slug_or_id = 'threads.slug';
    // }
    // let nickname = ctx.request.body.nickname;
    // let voice = ctx.request.body.voice;
    // let deltaVoice = 0;
    // let threadId = 0;
    // let thread;
    //
    // const oldThread = await threadService.getThreadForAdd(slug);
    //
    // if (!oldThread) {
    //   ctx.body = null;
    //   ctx.status = 404;
    //
    //   return;
    // }
    //
    // let vote = null;
    // try {
    //   vote = await threadService.getVote(nickname, oldThread.id);
    //
    //   const delta = voice - vote.voice;
    //
    //   await threadService.transaction(transaction => {
    //     const votes = threadService.updateVotes(vote.id, voice, transaction);
    //     const threads = threadService.updateThreads(threadId, delta, transaction);
    //
    //     return transaction.batch([votes, threads]);
    //   });
    //
    //   ctx.body = thread;
    //   ctx.status = 200;
    // } catch (error) {
    //   try {
    //     await threadService.transaction(transaction => {
    //       const insert = threadService.createVote(nickname, voice, threadId, transaction);
    //       const update = threadService.updateThreads(threadId, voice, transaction);
    //
    //       return transaction.batch([insert, update]);
    //     });
    //
    //     ctx.body = oldThread;
    //     ctx.status = 200;
    //   } catch (error) {
    //     ctx.body = null;
    //     ctx.status = 404;
    //
    //     return;
    //   }
    // }
  }

  async getThread(ctx, next) {
    let slug = ctx.params.slug_or_id;
    let query = 'threads.id';
    if (+slug) {
      query = 'threads.slug';
    }

    return threadService.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title, threads.slug, ' +
      ' threads.message, threads.id, threads.votes' +
      ' from threads inner join forums on (threads.forum = forums.id) where ' + query + ' = $1', slug)
      .then(data => {
        ctx.body = data;
        ctx.status = 200;
      })
      .catch(err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }

  async getPosts(ctx, next) {
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
      marker = +ctx.request.query.marker;
    }
    let sort = 'flat';
    if ('sort' in ctx.request.query && ctx.request.query !== 'flat') {
      sort = ctx.request.query.sort;
    }
    let slug = ctx.params.slug_or_id;
    let str_query = 'threads.id';
    if (+slug) {
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
    let slug = ctx.params.slug_or_id;
    let query = 'threads.id';
    if (+slug) {
      query = 'threads.slug';
    }

    return threadService.dataBase.one('select * from threads where ' + query + ' = $1', slug)
      .then(data => {
        return threadService.dataBase.tx((t) => {
          let q1 = t.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
            ' threads.slug, threads.message, threads.id from threads inner join forums' +
            ' on (threads.forum=forums.id) where ' + query + ' = $1', slug);
          if (ctx.request.body.title && ctx.request.body.message) {
            q1 = t.none('update threads set (title, message) = (\'' + ctx.request.body.title + '\',' +
              '\'' + ctx.request.body.message + '\') where ' + query + ' = $1', slug);
          } else if (ctx.request.body.title) {
            q1 = t.none('update threads set (title) = (\'' + ctx.request.body.title + '\') where ' + query + ' = $1', slug);
          } else if (ctx.request.body.message) {
            q1 = t.none('update threads set (message) = (\'' + ctx.request.body.message + '\') where ' + query + ' = $1', slug);
          }
          let q2 = t.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
            ' threads.slug, threads.message, threads.id from threads inner join forums' +
            ' on (threads.forum=forums.id) where ' + query + ' = $1', slug);
          return t.batch([q1, q2]);
        });
      })
      .then(data => {
        ctx.body = data[1];
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
