import Router from 'koa-router';
import serviceController from '../controllers/serviceController';

const serviceRouter = new Router();

serviceRouter.get('/api/service/status', serviceController.getStatus);
// serviceRouter.post('/api/service/clear', serviceController.serviceClear);

export default serviceRouter;
