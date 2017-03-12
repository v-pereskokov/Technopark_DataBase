class User {
  constructor(user) {
    this.setUser(user);
  }

  getUser() {
    return {
      fullname: this._fullname,
      nickname: this._nickname,
      email: this._email,
      about: this._about
    };
  }

  setUser(user) {
    this._fullname = user.fullname;
    this._nickname = user.nickname;
    this._email = user.email;
    this._about = user.about;
  }
}

module.exports.User = User;
