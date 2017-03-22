const Router = require('koa-router');
const threadController = require('../../controllers/ThreadController/ThreadController');

const threadRouter = new Router();

threadRouter.post('/api/thread/:slug_or_id/create', threadController.threadController.createOneThread);
threadRouter.post('/api/thread/:slug_or_id/vote', threadController.threadController.createVote);
threadRouter.get('/api/thread/:slug_or_id/details', threadController.threadController.getThread);
threadRouter.post('/api/thread/:slug_or_id/details', threadController.threadController.updateThread);
threadRouter.get('/api/thread/:slug_or_id/posts', threadController.threadController.getPosts);

module.exports.threadRouter = threadRouter;
