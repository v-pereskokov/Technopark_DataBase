import Router from 'koa-router';
import forumController from '../controllers/forumController';

const forumRouter = new Router();

forumRouter.post('/api/forum/create', forumController.create);
forumRouter.get('/api/forum/:slug/details', forumController.get);
forumRouter.post('/api/forum/:slug/create', forumController.createThread);
forumRouter.get('/api/forum/:slug/threads', forumController.getThreads);
// forumRouter.get('/api/forum/:slug/users', forumController.getUsers);

export default forumRouter;
