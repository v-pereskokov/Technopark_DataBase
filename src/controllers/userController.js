import userService from '../services/userService';

class UserController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      try {
        ctx.body = await userService.getUser(body.nickname, body.email);
        ctx.status = 409;

        resolve();
      } catch(e) {
        await userService.create(body);

        ctx.body = body;
        ctx.status = 201;

        resolve();
      }
    });
  }

  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      try {
        ctx.body = await userService.getUserByNickname(ctx.params.nickname);;
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = 'Not Found!';
        ctx.status = 404;

        resolve();
      }
    });
  }

  update(ctx, next) {
    return new Promise(async (resolve, reject) => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      try {
        const response = await userService.update(body);

        ctx.body = response;
        ctx.status = 200;
        resolve();
      } catch(e) {
        console.log(e);
        ctx.body = e;
        ctx.status = 500;
        resolve();
      }
    });
  }
}

const userController = new UserController();
export default userController;
