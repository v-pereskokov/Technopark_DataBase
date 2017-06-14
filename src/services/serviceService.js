import BaseService from './baseService';

class ServiceService extends BaseService {
  constructor() {
    super();
  }

  getStatus() {
    this.query = `SELECT 
    (SELECT count(*) FROM forums)::int AS forum, 
    (SELECT count(*) FROM posts)::int AS post, 
    (SELECT count(*) FROM threads)::int AS thread, 
    (SELECT count(*) FROM users)::int AS "user"`;

    return this.dataBase.one(this.query);
  }

  truncate(posts, threads, forums, users) {
    this.query = `TRUNCATE TABLE ${posts} CASCADE;TRUNCATE TABLE ${threads} CASCADE;
    TRUNCATE TABLE ${forums} CASCADE;TRUNCATE TABLE ${users} CASCADE`;

    return this.dataBase.none(this.query);
  }
}

const serviceService = new ServiceService();
export default serviceService;
