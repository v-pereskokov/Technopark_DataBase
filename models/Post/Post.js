class Post {
  constructor(post) {
    this.setPost(post);
  }

  getPost() {
    return {
      id: this._id,
      thread: this._thread,
      author: this._author,
      forum: this._forum,
      message: this._message,
      parent: this._parent,
      isEdited: this._isEdited,
      created: this._created,
    };
  }

  setPost(post) {
    this._id = post.id;
    this._thread = post.thread;
    this._author = post.author;
    this._forum = post.forum;
    this._message = post.message;
    this._parent = post.parent;
    this._isEdited = post.isEdited;
    this._created = post.created;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get thread() {
    return this._thread;
  }

  set thread(value) {
    this._thread = value;
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

  get message() {
    return this._message;
  }

  set message(value) {
    this._message = value;
  }

  get parent() {
    return this._parent;
  }

  set parent(value) {
    this._parent = value;
  }

  get isEdited() {
    return this._isEdited;
  }

  set isEdited(value) {
    this._isEdited = value;
  }

  get created() {
    return this._created;
  }

  set created(value) {
    this._created = value;
  }
}

module.exports.Post = Post;
