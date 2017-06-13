import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import userRouter from './routes/userRoutes';
import forumRouter from './routes/forumRoutes';
import threadRouter from './routes/threadRoutes';
import postRouter from './routes/postRoutes';
import serviceRouter from './routes/serviceRoutes';

const app = new Koa();
const port = process.env.PORT || 5000;

app
  .use(bodyParser())
  .use(userRouter.routes())
  .use(forumRouter.routes())
  .use(threadRouter.routes())
  .use(postRouter.routes())
  .use(serviceRouter.routes());

app.listen(port, () => console.log('Server is running on port:', port));
