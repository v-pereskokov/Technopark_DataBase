import top from './top';

async function bar() {
  await top();
  console.log('after foo');
}

bar();
