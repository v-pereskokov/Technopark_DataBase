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

      if(isNumeric(slug) === false) {
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

          for(let j = 0; j < arr.length; j++) {
            if(arr[j].parent === 0) {
              ++check;
            } else {
              if(!isEmpty(data)) {
                for (let i = 0; i < data.length; i++) {
                  if (arr[j].parent === data[i].id) {
                    ++check;
                  }
                }
              }
            }
          }
          if(check === num_post) {
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
        .then(function (data) {
          let pst = data.posts;
          pst += arr2.length;
          return dataBase.dataBase.none('update forums set (posts) = (' + pst + ') where upper(slug) = $1', dataForum.toUpperCase())
        })
        .then(function () {
          arr2.sort(compareNumeric);
          return dataBase.dataBase.any('select posts.author, posts.created, posts.id, posts.isEdited, posts.message, posts.thread,' +
            'posts.forum, posts.parent from posts where posts.id >= $1 order by posts.id ', arr2[0]);
        })
        .then(function (data) {
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
