const Router = require('koa-router');
const postController = require('../../controllers/PostController/PostController');

const postRouter = new Router();

postRouter.get('/api/post/:id/details', postController.postController.getPost);
postRouter.post('/api/post/:id/details', postController.postController.updatePost);

module.exports.postRouter = postRouter;
