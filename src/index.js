import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import userRouter from './routes/userRoutes';
import forumRouter from './routes/forumRoutes';
import threadRouter from './routes/threadRoutes';
import postRouter from './routes/postRoutes';

const app = new Koa();
const port = process.env.PORT || 5000;

app
  .use(bodyParser())
  .use(userRouter.routes())
  .use(forumRouter.routes())
  .use(threadRouter.routes())
  .use(postRouter.routes());

app.listen(port, () => console.log('Server is running on port:', port));
