const Router = require('koa-router');
const forumController = require('../../controllers/ForumController/ForumController');

const forumRouter = new Router();

forumRouter.post('/api/forum/create', forumController.forumController.create);

module.exports.forumRouter = forumRouter;
