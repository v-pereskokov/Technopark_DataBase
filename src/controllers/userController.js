import userService from '../services/userService';

class UserController {
  create(ctx, next) {
    return new Promise(async (resolve, reject) => {
      let body = ctx.request.body;
      body['nickname'] = ctx.params.nickname;

      try {
        const data = await userService.getUser(body.nickname, body.email);
        ctx.body = data;
        ctx.status = 409;

        console.log(data);
        resolve();
      } catch(e) {
        await userService.create(body);

        ctx.body = body;
        ctx.status = 201;

        console.log(e);

        resolve();
      }
    });
  }
}

const userController = new UserController();
export default userController;
