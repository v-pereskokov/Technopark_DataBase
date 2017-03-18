const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

const port = process.env.PORT || 3000;

const select = require('./Services/UserService/UserService');

router.post('/', select.a);

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port, () => {
  console.log('Server is running on port:', port);
});
