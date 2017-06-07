import Router from 'koa-router';
import postController from '../controllers/postController';

const postRouter = new Router();

postRouter.get('/api/post/:id/details', postController.get);
// postRouter.post('/api/post/:id/details', postController.updatePost);

export default postRouter;
