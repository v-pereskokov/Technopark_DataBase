class User {
  constructor(user) {
    this.setUser(user);
  }

  getUser() {
    return {
      fullname: this.fullname,
      nickname: this.nickname,
      email: this.email,
      about: this.about
    };
  }

  setUser(user) {
    this.fullname = user.fullname;
    this.nickname = user.nickname;
    this.email = user.email;
    this.about = user.about;
  }

  get fullname() {
    return this.fullname;
  }

  set fullname(value) {
    this.fullname = value;
  }

  get nickname() {
    return this.nickname;
  }

  set nickname(value) {
    this.nickname = value;
  }

  get email() {
    return this.email;
  }

  set email(value) {
    this.email = value;
  }

  get about() {
    return this.about;
  }

  set about(value) {
    this.about = value;
  }
}

module.exports.User = User;
