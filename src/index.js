import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import userRouter from './routes/userRoutes';

const app = new Koa();
const port = process.env.PORT || 5000;

app
  .use(bodyParser())
  .use(userRouter.routes());

app.listen(port, () => console.log('Server is running on port: ', port));
