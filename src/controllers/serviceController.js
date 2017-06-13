import Promise from 'bluebird';
import serviceService from '../services/serviceService';

class ServiceController {
  getStatus(ctx, next) {
    return new Promise(async (resolve, reject) => {
      ctx.body = await serviceService.getStatus();
      ctx.status = 200;

      resolve();
    });
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
