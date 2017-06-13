import Promise from 'bluebird';
import serviceService from '../services/serviceService';

class ServiceController {
  async getStatus(ctx, next) {
    ctx.body = await serviceService.getStatus();
    ctx.status = 200;
  }

  clear(ctx, next) {
    return new Promise(async (resolve, reject) => {
      await serviceService.truncate('posts', 'threads', 'forums', 'users');

      ctx.body = '';
      ctx.status = 200;

      resolve();
    });
  }
}

const serviceController = new ServiceController();
export default serviceController;
