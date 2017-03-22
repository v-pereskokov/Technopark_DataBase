const userService = require('../../services/UserService/UserService');
const forumService = require('../../services/ForumService/ForumService');
const threadService = require('../../services/ThreadService/ThreadService');
const dataBase = require('../../database/DataBase');

class ThreadController {
  constructor() {
  }

  createOneThread(ctx, next) {
    return new Promise(resolve => {
      const body = ctx.request.body;
      let slug = ctx.params.slug_or_id;
      let num_post = ctx.request.body.length;
      let dataForum = '';
      let str_query = '';
      let arr = [];
      let arr2 = [];

      if (isNumeric(slug) === false) {
        str_query = 'upper(threads.slug)';
        slug = slug.toUpperCase();
      } else {
        str_query = 'threads.id';
      }

      dataBase.dataBase.one('select threads.id, forums.slug as forum from threads ' +
        'inner join forums on (threads.forum = forums.id) where ' + str_query + ' = $1', slug)
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        })
        .then(data => {
          dataForum = data.forum;

          for (let key in body) {
            arr.push({
              author: body[key].author,
              isEdited: body[key].isEdited,
              message: body[key].message,
              parent: body[key].parent ? body[key].parent : 0,
              thread: data.id,
              forum: dataForum
            });
          }
          return dataBase.dataBase.any('select * from posts where posts.thread = $1', data.id);
        })
        .then(data => {
          let check = 0;

          for (let j = 0; j < arr.length; j++) {
            if (arr[j].parent === 0) {
              ++check;
            } else {
              if (!isEmpty(data)) {
                for (let i = 0; i < data.length; i++) {
                  if (arr[j].parent === data[i].id) {
                    ++check;
                  }
                }
              }
            }
          }
          if (check === num_post) {
            return dataBase.dataBase.tx(t => {
              let queries = arr.map(l => {
                return t.one('INSERT INTO posts (author, isEdited, message, parent, thread, forum) ' +
                  'VALUES(${author}, ${isEdited}, ${message}, ${parent}, ${thread}, ${forum}) returning id;', l);
              });
              return t.batch(queries);
            });
          } else {
            ctx.status = 409;
            resolve();
          }
        })
        .then(data => {
          for (let i = 0; i < data.length; i++) {
            arr2.push(data[i].id);
          }
          return dataBase.dataBase.one('select forums.posts from forums where upper(slug) = $1', dataForum.toUpperCase());
        })
        .then(data => {
          let pst = data.posts;
          pst += arr2.length;
          return dataBase.dataBase.none('update forums set (posts) = (' + pst + ') where upper(slug) = $1', dataForum.toUpperCase())
        })
        .then(function () {
          arr2.sort(compareNumeric);
          return dataBase.dataBase.any('select posts.author, posts.created, posts.id, posts.isEdited, posts.message, posts.thread,' +
            'posts.forum, posts.parent from posts where posts.id >= $1 order by posts.id ', arr2[0]);
        })
        .then(data => {
          ctx.body = data;
          ctx.status = 201;
          resolve();
        })
        .catch(function (err) {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  createVote(ctx, next) {
    return new Promise(resolve => {
      let slug = ctx.params.slug_or_id;
      let slugid = +ctx.params.slug_or_id;

      let nickname = ctx.request.body.nickname;
      let voice = ctx.request.body.voice;
      let thrvotes = 0;

      if (isNumeric(slug) === false) {
        dataBase.dataBase.one('select * from threads where upper(threads.slug) = $1', slug.toUpperCase())
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          })
          .then(data => {
            thrvotes = data.votes;
            return dataBase.dataBase.one('select * from votes where votes.username = $1 and votes.thread = $2', [nickname, data.id])
          })
          .then(data => {
            thrvotes = thrvotes - data.voice + voice;
            return dataBase.dataBase.one('update votes set (voice) = (' + voice + ') where id = $1 returning thread', data.id)
          })
          .then(data => {
            return dataBase.dataBase.one('update threads set (votes) = (' + thrvotes + ') where id = $1 returning id', data.thread)
          })
          .then(data => {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.id,' +
              ' threads.message, threads.slug, threads.title, threads.votes from threads inner join forums' +
              ' on (threads.forum=forums.id) where threads.id = $1', data.id);
          })
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(() => {
            return dataBase.dataBase.one('select * from threads where upper(threads.slug) = $1', slug.toUpperCase())
          })
          .then(data => {
            thrvotes = data.votes + voice;
            return dataBase.dataBase.one('insert into votes (username, voice, thread) ' +
              'values (\'' + nickname + '\',' + voice + ',\'' + data.id + '\') returning thread')
          })
          .then(data => {
            return dataBase.dataBase.one('update threads set (votes) = (' + thrvotes + ') where id = $1 returning id', data.thread)
          })
          .then(data => {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.id,' +
              ' threads.message, threads.slug, threads.title, threads.votes from threads inner join forums' +
              ' on (threads.forum=forums.id) where threads.id = $1', data.id);
          })
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          });
      } else {
        dataBase.dataBase.one('select * from threads where threads.id = $1', slug)
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          })
          .then(data => {
            thrvotes = data.votes;
            return dataBase.dataBase.one('select * from votes where votes.username = $1 and votes.thread = $2', [nickname, data.id])
          })
          .then(data => {
            thrvotes = thrvotes - data.voice + voice;
            return dataBase.dataBase.one('update votes set (voice) = (' + voice + ') where id = $1 returning thread', data.id)
          })
          .then(data => {
            return dataBase.dataBase.one('update threads set (votes) = (' + thrvotes + ') where id = $1 returning id', data.thread)
          })
          .then(data => {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.id,' +
              ' threads.message, threads.slug, threads.title, threads.votes from threads inner join forums' +
              ' on (threads.forum=forums.id) where threads.id = $1', data.id);
          })
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(() => {
            return dataBase.dataBase.one('select * from threads where threads.id = $1', slug)
          })
          .then(data => {
            thrvotes = data.votes + voice;
            return dataBase.dataBase.one('insert into votes (username, voice, thread) ' +
              'values (\'' + nickname + '\',' + voice + ',\'' + data.id + '\') returning thread')
          })
          .then(data => {
            return dataBase.dataBase.one('update threads set (votes) = (' + thrvotes + ') where id = $1 returning id', data.thread)
          })
          .then(data => {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.id,' +
              ' threads.message, threads.slug, threads.title, threads.votes from threads inner join forums' +
              ' on (threads.forum=forums.id) where threads.id = $1', data.id);
          })
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          });
      }
    });
  }

  getThread(ctx, next) {
    return new Promise(resolve => {
      let slug = ctx.params.slug_or_id;

      if(!isNumeric(slug)) {
        dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title, threads.slug, ' +
          ' threads.message, threads.id, threads.votes' +
          ' from threads inner join forums on (threads.forum=forums.id)' +
          ' where upper(threads.slug) = $1', slug.toUpperCase())
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          });
      } else {
        dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title, threads.slug, ' +
          ' threads.message, threads.id, threads.votes' +
          ' from threads inner join forums on (threads.forum=forums.id)' +
          ' where threads.id = $1', slug)
          .then(data => {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          })
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          });
      }
    });
  }

  updateThread(ctx, next) {
    return new Promise(resolve => {
      let slug = ctx.params.slug_or_id;

      let str_query = '';
      if(isNumeric(slug) === false) {
        str_query = 'upper(threads.slug)';
        slug = slug.toUpperCase();
      } else {
        str_query = 'threads.id';
      }

      dataBase.dataBase.one('select * from threads where ' + str_query + ' = $1', slug)
        .then(data => {
          if(!isEmpty(ctx.request.body.title) && !isEmpty(ctx.request.body.message)) {
            return dataBase.dataBase.none('update threads set (title, message) = (\'' + ctx.request.body.title + '\',' +
              '\'' + ctx.request.body.message + '\') where ' + str_query + ' = $1', slug);
          } else if (!isEmpty(ctx.request.body.title)) {
            return dataBase.dataBase.none('update threads set (title) = (\'' + ctx.request.body.title + '\') where ' + str_query + ' = $1', slug);
          } else if (!isEmpty(ctx.request.body.message)) {
            return dataBase.dataBase.none('update threads set (message) = (\'' + ctx.request.body.message + '\') where ' + str_query + ' = $1', slug);
          } else {
            return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
              ' threads.slug, threads.message, threads.id from threads inner join forums' +
              ' on (threads.forum=forums.id) where ' + str_query + ' = $1', slug);
          }
        })
        .then(data => {
          return dataBase.dataBase.one('select forums.slug as forum, threads.author, threads.created, threads.title,' +
            ' threads.slug, threads.message, threads.id from threads inner join forums' +
            ' on (threads.forum=forums.id) where ' + str_query + ' = $1', slug);
        })
        .then(data => {
          ctx.body = JSON.parse(JSON.stringify(data));
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  getPosts(ctx, next) {
    return new Promise(resolve => {
      const desc = ctx.query.desc;
      const limit = ctx.query.limit;
      const marker = +ctx.query.marker;
      const sort = ctx.query.sort;
      let slug = ctx.params.slug_or_id;

      let str_query = '';
      if(isNumeric(slug) === false) {
        str_query = 'upper(threads.slug)';
        slug = slug.toUpperCase();
      } else {
        str_query = 'threads.id';
      }
      let query;

      dataBase.dataBase.one('select * from threads where ' + str_query + ' = $1', slug)
        .then(data => {
          if(sort === 'flat') {
            query = 'select posts.author, posts.created, posts.id, posts.isEdited, posts.message, posts.thread,' +
              'posts.forum, posts.parent from posts where posts.thread = $1 ';
            query = query + 'order by posts.id ';
            if(desc === 'true') {
              query = query + 'desc ';
            }
            if(!isEmpty(limit)) {
              query = query + 'limit ' + limit;
            }
            if(marker) {
              query = query + 'offset ' + marker;
            }
            return dataBase.dataBase.any(query, data.id);
          } else if(sort === 'tree') {
            query = 'with recursive tree(id, parent, author, message, isEdited, forum, thread, created, path) AS( ' +
              'select id, parent, author, message, isEdited, forum, thread, created, ARRAY[id] from posts where' +
              ' thread = $1 and parent=0 union ' +
              'select posts.id, posts.parent, posts.author, posts.message, posts.isEdited, posts.forum, ' +
              'posts.thread, posts.created, path||posts.id FROM posts ' +
              'join tree on posts.parent = tree.id where posts.thread = $1) ' +
              'select id, parent, author, message, isEdited, forum, thread, created from tree ';
            if(desc === 'true') {
              query = query + 'order by path desc ';
            } else {
              query = query + 'order by path, created asc ';
            }
            if(!isEmpty(limit)) {
              query = query + 'limit ' + limit;
            }
            if(marker) {
              query = query + 'offset ' + marker;
            }
            return dataBase.dataBase.any(query, data.id);
          } else if(sort === 'parent_tree')
          {
            query = 'WITH RECURSIVE tree(id, parent, author, message, isEdited, forum, thread, created, path) AS(' +
              '(SELECT id, parent, author, message, isEdited, forum, thread, created, ARRAY[id] FROM posts ' +
              'WHERE thread = $1 AND parent=0';
            if (desc === "true") {
              query = query + ' order by id desc ';
            } else {
              query = query + ' order by id asc ';
            }
            if(!isEmpty(limit)) {
              query = query + 'limit ' + limit;
            }
            if(marker) {
              query = query + 'offset ' + marker;
            }
            query = query + ') UNION ' +
              'SELECT posts.id, posts.parent, posts.author, posts.message, posts.isEdited, posts.forum, posts.thread, ' +
              'posts.created, path||posts.id FROM posts JOIN tree ON posts.parent = tree.id ' +
              'WHERE posts.thread = $1) SELECT id, parent, author, message, isEdited, forum, thread, created FROM tree';
            if (desc === "true") {
              query = query + ' order by path desc';
            } else {
              query = query + ' order by path asc';
            }
            return dataBase.dataBase.any(query, data.id);
          } else {
            query = 'select posts.author, posts.created, posts.id, posts.isEdited, posts.message, posts.thread, ' +
              'posts.forum, posts.parent from posts where posts.thread = $1 ';
            query = query + 'order by posts.id ';
            if(desc === 'true') {
              query = query + 'desc ';
            }
            if (!isEmpty(limit)) {
              query = query + 'limit ' + limit;
            }
            if (marker) {
              query = query + ' offset ' + marker;
            }
            return dataBase.dataBase.any(query, data.id);
          }
        })
        .then(data => {
          let m = 3;

          if (marker) {
            m = marker + 3;
          }

          if (isEmpty(data) === true) {
            m = m - 3;
          }
          m = String(m);

          ctx.body = {
            marker: m,
            posts: data
          };
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function compareNumeric(a, b) {
  if (a > b) return 1;
  if (a < b) return -1;
}

const threadController = new ThreadController();

module.exports.threadController = threadController;
