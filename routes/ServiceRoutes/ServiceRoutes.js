const Router = require('koa-router');
const serviceController = require('../../controllers/ServiceController/ServiceController');

const serviceRouter = new Router();

serviceRouter.get('/api/service/status', serviceController.serviceController.getStatus);
serviceRouter.post('/api/service/clear', serviceController.serviceController.serviceClear);

module.exports.serviceRouter = serviceRouter;
