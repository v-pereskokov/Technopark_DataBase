const userService = require('../../services/UserService/UserService');
const objectCompare = require('../../tools/ObjectCompare/ObjectCompare');

class UserController {
  constructor() {

  }

  create(ctx, next) {
    return new Promise(resolve => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;
      let result = [];

      userService.userService.create(body)
        .then(() => {
          ctx.body = body;
          ctx.status = 201;
          resolve();
        })
        .catch(error => {
          userService.userService.getUserByNickname(body.nickname)
            .then(dataNickname => {
              if (dataNickname) {
                delete dataNickname.id;
                result.push(dataNickname);
              }

              userService.userService.getUserByEmail(body.email)
                .then(dataEmail => {
                  if (dataEmail) {
                    delete dataEmail.id;

                    if (!objectCompare.objectCompare(result[0], dataEmail)) {
                      result.push(dataEmail);
                    }
                  }

                  ctx.body = result;
                  ctx.status = 409;
                  resolve();
                })
                .catch(error => {
                  ctx.body = result;
                  ctx.status = 409;
                  resolve();
                });
            })
            .catch(error => {
              userService.userService.getUserByEmail(body.email)
                .then(dataEmail => {
                  if (dataEmail) {
                    delete dataEmail.id;

                    if (objectCompare.objectCompare(result[0], dataEmail)) {
                      result.push(dataEmail);
                    }
                  }

                  ctx.body = result;
                  ctx.status = 409;
                  resolve();
                })
                .catch(error => {
                  ctx.body = result;
                  ctx.status = 409;
                  resolve();
                });
            });
        });
    });
  }

  get(ctx, next) {
    return new Promise(resolve => {
      userService.userService.getUserByNickname(ctx.params.nickname)
        .then(data => {
          ctx.body = data;
          ctx.status = 200;
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
        userService.userService.update(body)
          .then(data => {
            console.log('data: \n');
            console.log(data);
            ctx.body = body;
            ctx.status = 200;
            resolve();
          })
          .catch(error => {
            ctx.body = error;
            ctx.status = 409;
            resolve();
          });
      }
    });
  }
}

const userController = new UserController();

module.exports.userController = userController;
