class Vote {
  constructor(vote) {
    this.setVote(vote);
  }

  getVote() {
    return {
      nickname: this._nickname,
      voice: this._voice,
    };
  }

  setVote(vote) {
    this._nickname = vote.nickname;
    this._voice = vote.voice;
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(value) {
    this._nickname = value;
  }

  get voice() {
    return this._voice;
  }

  set voice(value) {
    this._voice = value;
  }
}

module.exports.Vote = Vote;
