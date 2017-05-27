import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

const app = new Koa();
const port = process.env.PORT || 5000;

app
  .use(bodyParser());

app.listen(port, () => console.log('Server is running on port: ', port));
