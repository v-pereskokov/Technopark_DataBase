const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

const port = process.env.PORT || 5000;

const userRouter = require('./routes/UserRoutes/UserRoutes');
const forumRouter = require('./routes/ForumRoutes/ForumRoutes');
const threadRouter = require('./routes/ThreadRoutes/ThreadRoutes');
const postRouter = require('./routes/PostRoutes/PostRoutes');
const serviceRouter = require('./routes/ServiceRoutes/ServiceRoutes');

app
  .use(bodyParser())
  .use(userRouter.userRouter.routes())
  .use(threadRouter.threadRouter.routes())
  .use(postRouter.postRouter.routes())
  .use(serviceRouter.serviceRouter.routes())
  .use(forumRouter.forumRouter.routes());

app.listen(port, () => {
  console.log('Server is running on port:', port);
});
