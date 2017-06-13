import serviceService from '../services/serviceService';

class ServiceController {
  async getStatus(ctx, next) {
    ctx.body = await serviceService.getStatus();
    ctx.status = 200;
  }

  async clear(ctx, next) {
    await serviceService.truncate('posts', 'threads', 'forums', 'users');

    ctx.body = '';
    ctx.status = 200;
  }
}

const serviceController = new ServiceController();
export default serviceController;
