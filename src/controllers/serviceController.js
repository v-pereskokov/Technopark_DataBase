import serviceService from '../services/serviceService';

class ServiceController {
  getStatus(ctx, next) {
    return new Promise(async (resolve, reject) => {
      const status = await serviceService.getStatus();
      ctx.body = {
        forum: +status.forum,
        post: +status.post,
        thread: +status.thread,
        user: +status.user
      };
      ctx.status = 200;

      resolve();
    });
  }

  clear(ctx, next) {
    return new Promise(async (resolve, reject) => {
      await serviceService.truncate('posts');
      await serviceService.truncate('threads');
      await serviceService.truncate('forums');
      await serviceService.truncate('users');

      ctx.body = '';
      ctx.status = 200;

      resolve();
    });
  }
}

const serviceController = new ServiceController();
export default serviceController;
