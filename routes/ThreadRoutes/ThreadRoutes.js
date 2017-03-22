const Router = require('koa-router');
const threadController = require('../../controllers/ThreadController/ThreadController');

const threadRouter = new Router();

threadRouter.post('/api/thread/:slug_or_id/create', threadController.threadController.createOneThread);

module.exports.threadRouter = threadRouter;
