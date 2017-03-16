class PostDetails {
  constructor(postDetails) {
    this.setPostDetails(postDetails);
  }

  getPostDetails() {
    return {
      author: this._author,
      forum: this._forum,
      post: this._post,
      thread: this._thread
    };
  }

  setPostDetails(postDetails) {
    this._author = postDetails.author;
    this._forum = postDetails.forum;
    this._post = postDetails.post;
    this._thread = postDetails.thread;
  }

  get author() {
    return this._author;
  }

  set author(value) {
    this._author = value;
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

module.exports.PostDetails = PostDetails;
