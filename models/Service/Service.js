class Service {
  constructor(service) {
    this.setService(service);
  }

  getService() {
    return {
      user: this._user,
      forum: this._forum,
      post: this._post,
      thread: this._thread
    };
  }

  setService(service) {
    this._user = service.user;
    this._forum = service.forum;
    this._post = service.post;
    this._thread = service.thread;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get forum() {
    return this._forum;
  }

  set forum(value) {
    this._forum = value;
  }

  get post() {
    return this._post;
  }

  set post(value) {
    this._post = value;
  }

  get thread() {
    return this._thread;
  }

  set thread(value) {
    this._thread = value;
  }
}

module.exports.Service = Service;
