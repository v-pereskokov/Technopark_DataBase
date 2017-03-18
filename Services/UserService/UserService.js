class UserService {
  constructor() {
    this._query = '';
  }

  createTable() {
    this._query = "CREATE TABLE IF NOT EXISTS \"user\" (" +
      "id SERIAL NOT NULL PRIMARY KEY," +
      "about TEXT," +
      "nickname VARCHAR(15) NOT NULL UNIQUE," +
      "fullname VARCHAR(30)," +
      "email VARCHAR(30) NOT NULL UNIQUE)";
  }

  createUser(user) {

  }
}

const dataBase = require('../../config');

const a = (ctx, next) => new Promise((resolve, reject) => {
  dataBase.dataBase.manyOrNone('SELECT * FROM items WHERE text = ${text};', {
    text: ctx.request.body.text
  })
    .then(data => {
      ctx.body = data;
      resolve();
    })
    .catch(error => {
      console.log(error);
      ctx.body = error;
      resolve();
    });
});

module.exports.a = a;
