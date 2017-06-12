import DataBase from './dataBase/dataBase';

const dataBase = new DataBase({
  user: 'docker',
  database: 'docker',
  password: 'docker',
  host: 'localhost',
  port: 5432
});

export default dataBase;
