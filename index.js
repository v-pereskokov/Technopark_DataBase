const KoaServer = require('koa-server');
const server = new KoaServer();

const test = require('./test');
const top = new test.top();

server.get('/get',function*(){
  const name = this.cookie.get('name');
  this.body = name;
});
// Set
server.post('/set',function*(){
  this.cookie.set('name', top.getName());
  this.body = 'ok'
});

server.listen(3000);
