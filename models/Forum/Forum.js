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
}

module.exports.Forum = Forum;
