import userService from '../services/userService';

class UserController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      try {
        await userService.create(body);
        ctx.body = body;
        ctx.status = 201;

        resolve();
      } catch(e) {
        ctx.body = await userService.getUser(body.nickname, body.email);
        ctx.status = 409;

        resolve();
      }
    });
  }

  get(ctx, next) {
    return new Promise(async (resolve, reject) => {
      try {
        ctx.body = await userService.getUserByNickname(ctx.params.nickname);
        ctx.status = 200;

        resolve();
      } catch(e) {
        ctx.body = '';
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
        await userService.update(body);

        ctx.body = await userService.getUserByNickname(body.nickname);
        ctx.status = 200;

        resolve();
      } catch(e) {
        switch (+e.code) {
          case 23502:
            ctx.body = '';
            ctx.status = 404;
            break;
          case 23505:
            ctx.body = body;
            ctx.status = 409;
            break;
          default:
            break;
        }

        resolve();
      }
    });
  }
}

const userController = new UserController();
export default userController;
