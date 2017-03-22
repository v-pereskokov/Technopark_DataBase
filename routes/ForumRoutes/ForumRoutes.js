const Router = require('koa-router');
const forumController = require('../../controllers/ForumController/ForumController');

const forumRouter = new Router();

forumRouter.post('/api/forum/create', forumController.forumController.create);
forumRouter.get('/api/forum/:slug/details', forumController.forumController.get);
forumRouter.post('/api/forum/:slug/create', forumController.forumController.createThread);
forumRouter.get('/api/forum/:slug/threads', forumController.forumController.getThreads);
forumRouter.get('/api/forum/:slug/users', forumController.forumController.getUsers);

module.exports.forumRouter = forumRouter;
