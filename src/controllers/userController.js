import userService from '../services/userService';

class UserController {
  async create(ctx, next) {
    const body = ctx.request.body;
    const nickname = ctx.params.nickname;

    const user = await userService.getUser(nickname, body.email);

    if (user.length !== 0) {
      ctx.body = user;
      ctx.status = 409;

      return;
    }

    ctx.body = await userService.create(nickname, body);
    ctx.status = 201;
  }

  async get(ctx, next) {
    const user = await userService.getUserByNickname(ctx.params.nickname);

    ctx.body = user;
    ctx.status = user ? 200 : 404;
  }

  async update(ctx, next) {
    const body = ctx.request.body;
    body.nickname = ctx.params.nickname;

    await userService.task(async (task) => {
      const errors = await userService.checkErrors(body.nickname, body.email, task);

      if (errors.notfound) {
        ctx.body = null;
        ctx.status = 404;

        return;
      } else if (errors.conflict) {
        ctx.body = null;
        ctx.status = 409;

        return;
      }

      ctx.body = await userService.update(body, task);
      ctx.status = 200;
    });
  }
}

const userController = new UserController();
export default userController;
