import serviceService from '../services/serviceService';

class ServiceController {
  async getStatus(ctx, next) {
    let resp = {};

    return serviceService.dataBase.tx( t => {
      let q1 = t.one('select count(*) from users');
      let q2 = t.one('select count(*) from threads');
      let q3 = t.one('select count(*) from posts');
      let q4 = t.one('select count(*) from forums');
      return t.batch([q1, q2, q3, q4]);
    })
      .then( data => {
        resp.user = parseInt(data[0].count);
        resp.thread = parseInt(data[1].count);
        resp.post = parseInt(data[2].count);
        resp.forum = parseInt(data[3].count);
        ctx.body = resp;
        ctx.status = 200;
      })
      .catch( err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }

  async clear(ctx, next) {
    return serviceService.dataBase.none('truncate users cascade')
      .then( () => {
        ctx.body = null;
        ctx.status = 200;
      })
      .catch( err => {
        ctx.body = null;
        ctx.status = 404;
      });
  }
}

const serviceController = new ServiceController();
export default serviceController;
