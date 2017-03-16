class Thread {
  constructor(thread) {
    this.setThread(thread);
  }

  getThread() {
    return {
      id: this._id,
      title: this._title,
      author: this._author,
      forum: this._forum,
      message: this._message,
      votes: this._votes,
      slug: this._slug,
      created: this._created
    };
  }

  setThread(thread) {
    this._id = thread.id;
    this._title = thread.title;
    this._author = thread.author;
    this._forum = thread.forum;
    this._message = thread.message;
    this._votes = thread.votes;
    this._slug = thread.slug;
    this._created = thread.created;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get title() {
    return this._title;
  }

  set title(value) {
    this._title = value;
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

  get votes() {
    return this._votes;
  }

  set votes(value) {
    this._votes = value;
  }

  get slug() {
    return this._slug;
  }

  set slug(value) {
    this._slug = value;
  }

  get created() {
    return this._created;
  }

  set created(value) {
    this._created = value;
  }
}

module.exports.Thread = Thread;
