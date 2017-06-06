import Router from 'koa-router';
import threadController from '../controllers/threadController';

const threadRouter = new Router();

threadRouter.post('/api/thread/:slug_or_id/create', threadController.create);
threadRouter.post('/api/thread/:slug_or_id/vote', threadController.createVote);
// threadRouter.get('/api/thread/:slug_or_id/details', threadController.getThread);
// threadRouter.post('/api/thread/:slug_or_id/details', threadController.updateThread);
// threadRouter.get('/api/thread/:slug_or_id/posts', threadController.getPosts);

export default threadRouter;
