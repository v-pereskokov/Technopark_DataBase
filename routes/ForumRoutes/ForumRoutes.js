const Router = require('koa-router');
const forumController = require('../../controllers/ForumController/ForumController');

const forumRouter = new Router();

forumRouter.post('/api/forum/create', forumController.forumController.create);
forumRouter.get('/api/forum/:slug/details', forumController.forumController.get);
forumRouter.post('/api/forum/:slug/create', forumController.forumController.createThread);

module.exports.forumRouter = forumRouter;
