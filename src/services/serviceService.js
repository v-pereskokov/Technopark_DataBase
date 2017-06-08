import BaseService from './baseService';

class ServiceService extends BaseService {
  constructor() {
    super();
  }

  getStatus() {
    this.query = `SELECT 
    (SELECT count(*) FROM forums) AS forum, 
    (SELECT count(*) FROM posts) AS post, 
    (SELECT count(*) FROM threads) AS thread, 
    (SELECT count(*) FROM users) AS "user"`;

    return this.dataBase.one(this.query);
  }

  truncate(table) {
    this.query = `TRUNCATE TABLE ${table} CASCADE`;

    return this.dataBase.none(this.query);
  }
}

const serviceService = new ServiceService();
export default serviceService;
