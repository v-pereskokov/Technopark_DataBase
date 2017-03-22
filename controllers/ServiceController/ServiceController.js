const userService = require('../../services/UserService/UserService');
const forumService = require('../../services/ForumService/ForumService');
const threadService = require('../../services/ThreadService/ThreadService');
const dataBase = require('../../database/DataBase');

class ServiceController {
  constructor() {
  }

  getStatus(ctx, next) {
    return new Promise(resolve => {
      let user = 0;
      let thread = 0;
      let post = 0;
      let forum;

      dataBase.dataBase.one('select count(*) from users')
        .then(function (data) {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          user = d.count;
          return dataBase.dataBase.one('select count(*) from threads');
        })
        .then(function (data) {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          thread = d.count;
          return dataBase.dataBase.one('select count(*) from posts');
        })
        .then(function (data) {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          post = d.count;
          return dataBase.dataBase.one('select count(*) from forums');
        })
        .then(function (data) {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          forum = d.count;
          let obj = {};
          obj.user = parseInt(user);
          obj.thread = parseInt(thread);
          obj.post = parseInt(post);
          obj.forum = parseInt(forum);

          ctx.body = obj;
          ctx.status = 200;
          resolve();
        })
        .catch(function (err) {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  serviceClear(ctx, next) {
    return new Promise(resolve => {
      dataBase.dataBase.none('truncate users cascade')
        .then(function () {
          ctx.body = 'Ok';
          ctx.status = 200;
          resolve();
        })
        .catch(function (err) {
          return next(err);
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

const serviceController = new ServiceController();

module.exports.serviceController = serviceController;
