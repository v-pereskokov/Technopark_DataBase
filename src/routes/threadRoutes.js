import Router from 'koa-router';
import forumController from '../controllers/forumController';

const forumRouter = new Router();

forumRouter.post('/api/forum/create', forumController.create);
forumRouter.get('/api/forum/:slug/details', forumController.get);

export default forumRouter;
