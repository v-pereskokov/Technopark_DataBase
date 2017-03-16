class Forum {
  constructor(forum) {
    this.setForum(forum);
  }

  getForum() {
    return {
      username: this._username,
      title: this._title,
      threads: this._threads,
      slug: this._slug,
      posts: this._posts
    };
  }

  setForum(forum) {
    this._username = forum.username;
    this._title = forum.title;
    this._threads = forum.threads;
    this._slug = forum.slug;
    this._posts = forum.posts;
  }

  get username() {
    return this._username;
  }

  set username(value) {
    this._username = value;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    this._title = value;
  }

  get threads() {
    return this._threads;
  }

  set threads(value) {
    this._threads = value;
  }

  get slug() {
    return this._slug;
  }

  set slug(value) {
    this._slug = value;
  }

  get posts() {
    return this._posts;
  }

  set posts(value) {
    this._posts = value;
  }
}

module.exports.Forum = Forum;
