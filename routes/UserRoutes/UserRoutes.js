const Router = require('koa-router');
const userController = require('../../controllers/UserController/UserController');

const userRouter = new Router();

userRouter.post('/api/user/:nickname/create', userController.userController.create);
userRouter.get('/api/user/:nickname/profile', userController.userController.get);
userRouter.post('/api/user/:nickname/profile', userController.userController.update);

module.exports.userRouter = userRouter;
