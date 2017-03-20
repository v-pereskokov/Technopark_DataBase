const userService = require('../../services/UserService/UserService');
const objectCompare = require('../../tools/ObjectCompare/ObjectCompare');

class UserController {
  constructor() {

  }

  create(ctx, next) {
    return new Promise(resolve => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      userService.userService.getUser(body.nickname, body.email)
        .then(data => {
          if (data.length) {
            ctx.body = data;
            ctx.status = 409;
            resolve();
          } else {
            userService.userService.create(body)
              .then(() => {
                ctx.body = body;
                ctx.status = 201;
                resolve();
              })
              .catch(error => {
                ctx.body = error;
                ctx.status = 500;
                resolve();
              });
          }
        })
        .catch(error => {
          ctx.body = error;
          ctx.status = 500;
          resolve();
        });
    });
  }

  get(ctx, next) {
    return new Promise(resolve => {
      userService.userService.getUserByNickname(ctx.params.nickname)
        .then(data => {
          ctx.body = data ? data : null;
          ctx.status = data ? 200 : 404;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not Found!!';
          ctx.status = 404;
          resolve();
        });
    });
  }

  update(ctx, next) {
    return new Promise(resolve => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      if (body) {
        userService.userService.getUserByNickname(body.nickname)
          .then(data => {
            userService.userService.getUserByEmail(body.email)
              .then(data => {

                if (!data) {
                  userService.userService.update(body)
                    .then(() => {
                      userService.userService.getUserByNickname(body.nickname)
                        .then(data => {
                          ctx.body = body;
                          ctx.status = 200;
                          resolve();
                        })
                        .catch(error => {
                          ctx.body = 'Not found!';
                          ctx.status = 404;
                          resolve();
                        });
                    })
                    .catch(error => {
                      ctx.body = error;
                      ctx.status = 409;
                      resolve();
                    });
                } else {
                  ctx.body = null;
                  ctx.status = 409;
                  resolve();
                }
              })
              .catch(error => {
                //
              });
          })
          .catch(error => {
            ctx.body = 'Not found!';
            ctx.status = 404;
            resolve();
          });
      }
    });
  }
}

const userController = new UserController();

module.exports.userController = userController;
