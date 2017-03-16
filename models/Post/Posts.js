class Posts {
  constructor(posts) {
    this.setPosts(posts);
  }

  getPosts() {
    return {
      marker: this._marker,
      posts: this._posts,
    };
  }

  setPosts(posts) {
    this._marker = posts.marker;
    this._posts = posts.posts || [];
  }

  get marker() {
    return this._marker;
  }

  set marker(value) {
    this._marker = value;
  }

  get posts() {
    return this._posts;
  }

  set posts(value) {
    this._posts = value || [];
  }
}

module.exports.Posts = Posts;
