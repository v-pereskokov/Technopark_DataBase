const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

const port = process.env.PORT || 3000;

const userRouter = require('./routes/UserRoutes/UserRoutes');

app
  .use(bodyParser())
  .use(userRouter.userRouter.routes());

app.listen(port, () => {
  console.log('Server is running on port:', port);
});
