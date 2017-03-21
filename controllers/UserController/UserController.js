const userService = require('../../services/UserService/UserService');
const objectCompare = require('../../tools/ObjectCompare/ObjectCompare');
const dataBase = require('../../database/DataBase');
// const isEmpty = require('../../tools/isEmpty/isEmpty');


class UserController {
  constructor() {

  }

  create(ctx, next) {
    return new Promise(resolve => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      userService.userService.getUser(body.nickname, body.email)
        .then(data => {
          ctx.body = data;
          ctx.status = 409;
          resolve();
        })
        .catch(error => {
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

      let nickname = body.nickname;
      let fullname = body.fullname;
      let about = body.about;
      let email = body.email;

      userService.userService.getUserByNickname(body.nickname)
        .catch(error => {
          ctx.body = '';
          ctx.status = 404;
          resolve();
        })
        .then(data => {
          if (isEmpty(email) && isEmpty(about) && isEmpty(fullname)) {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          } else if (isEmpty(email)) {
            let names = [];
            let values = [];

            for (let key in data) {
              if (key && key !== 'nickname' && key !== 'email' && body[key] !== undefined) {
                names.push(`${key}`);
                values.push(`\'${body[key]}\'`);
              }
            }

            return userService.userService.update({
              names: names.join(', '),
              values: values.join(', '),
              nickname: data.nickname
            });
          } else {
            return userService.userService.getUserByEmail(email);
          }
        })
        .then(() => {
          if (isEmpty(email)) {
            return userService.userService.getUserByNickname(nickname);
          } else {
            let names = [];
            let values = [];

            for (let key in body) {
              if (key && key !== 'nickname' && body[key] !== undefined) {
                names.push(`${key}`);
                values.push(`\'${body[key]}\'`);
              }
            }

            return userService.userService.update({
              names: names.join(', '),
              values: values.join(', '),
              nickname: nickname
            });
          }
        })
        .then(function (data) {
          if (isEmpty(email)) {
            ctx.body = JSON.parse(JSON.stringify(data));
            ctx.status = 200;
            resolve();
          } else {
            return dataBase.dataBase.one('select * from users where upper(nickname) = $1', nickname.toUpperCase());
          }
        })
        .then(function (data) {
          ctx.body = JSON.parse(JSON.stringify(data));
          ctx.status = 200;
          resolve();
        })
        .catch(function (error) {
          ctx.body = '';
          ctx.status = 409;
          resolve();
        });
      // .then(data => {
      //   if (data) {
      //     if (!isEmptyEmail) {
      //       userService.userService.getUserByEmail(body.email)
      //         .then(data => {
      //           if (data) {
      //             ctx.body = data;
      //             ctx.status = 409;
      //             resolve();
      //           } else {
      //             userService.userService.update(body)
      //               .then(data => {
      //                 userService.userService.getUserByNickname(body.nickname)
      //                   .then(data => {
      //                     ctx.body = data;
      //                     ctx.status = 200;
      //                     resolve();
      //                   });
      //               })
      //               .catch(error => {
      //                 ctx.body = error;
      //                 ctx.status = 500;
      //                 resolve();
      //               });
      //           }
      //         })
      //         .catch(error => {
      //           userService.userService.update(body)
      //             .then(data => {
      //               userService.userService.getUserByNickname(body.nickname)
      //                 .then(data => {
      //                   ctx.body = data;
      //                   ctx.status = 200;
      //                   resolve();
      //                 });
      //             })
      //             .catch(error => {
      //               ctx.body = error;
      //               ctx.status = 500;
      //               resolve();
      //             });
      //         });
      //     } else if (isEmptyUpdate) {
      //       ctx.body = data;
      //       ctx.status = 200;
      //       resolve();
      //     } else {
      //       userService.userService.update(body)
      //         .then(data => {
      //           userService.userService.getUserByNickname(body.nickname)
      //             .then(data => {
      //               ctx.body = data;
      //               ctx.status = 200;
      //               resolve();
      //             });
      //         })
      //         .catch(error => {
      //           ctx.body = error;
      //           ctx.status = 500;
      //           resolve();
      //         });
      //     }
      //   } else {
      //     console.log('here');
      //     ctx.body = 'Not found!';
      //     ctx.status = 404;
      //     resolve();
      //   }
      // })
      // .catch(error => {
      //   ctx.body = error;
      //   ctx.status = 404;
      //   resolve();
      // });
    });
  }
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

const userController = new UserController();

module.exports.userController = userController;
