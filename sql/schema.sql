DROP INDEX IF EXISTS indexUsersOnEmail;
DROP INDEX IF EXISTS indexUsersOnNickname;
DROP INDEX IF EXISTS indexForumOnSlug;
DROP INDEX IF EXISTS indexThreadsOnAuthorId;
DROP INDEX IF EXISTS indexThreadsOnForumId;
DROP INDEX IF EXISTS indexThreadsOnSlug;
DROP INDEX IF EXISTS indexPostsOnAuthorId;
DROP INDEX IF EXISTS indexPostsOnForumId;
DROP INDEX IF EXISTS indexPostsOnParent;
DROP INDEX IF EXISTS indexPostsOnThreadId;
DROP INDEX IF EXISTS indexPostsOnPath;
DROP INDEX IF EXISTS indexVotesOnUserIdAndThreadId;
DROP INDEX IF EXISTS indexForumMembersOnUserId;

DROP TRIGGER IF EXISTS onVoteUpdate ON votes;
DROP TRIGGER IF EXISTS onVoteInsert ON votes;

DROP FUNCTION IF EXISTS voteInsert();
DROP FUNCTION IF EXISTS voteUpdate();

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS forums CASCADE;
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS forumMembers CASCADE;

SET SYNCHRONOUS_COMMIT = 'off';

CREATE TABLE IF NOT EXISTS users (
  id       BIGSERIAL PRIMARY KEY,
  nickname VARCHAR(50)  NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email    VARCHAR(50)  NOT NULL,
  about    TEXT
);


CREATE UNIQUE INDEX indexUsersOnNickname ON users (LOWER(nickname));
CREATE UNIQUE INDEX indexUsersOnEmail ON users (LOWER(email));


CREATE TABLE IF NOT EXISTS forums (
  id      BIGSERIAL     PRIMARY KEY,
  posts   INT           NOT NULL DEFAULT 0,
  slug    TEXT,
  threads INT           NOT NULL DEFAULT 0,
  title   TEXT          NOT NULL,
  "user"  TEXT          NOT NULL
);


CREATE UNIQUE INDEX indexForumOnSlug ON forums (LOWER(slug));
CREATE INDEX indexForumonUser ON forums (lower("user"));


CREATE TABLE IF NOT EXISTS threads (
  id        BIGSERIAL   PRIMARY KEY,
  author    TEXT        NOT NULL,
  created   TIMESTAMPTZ NOT NULL,
  forum     TEXT        NOT NULL ,
  message   TEXT        NOT NULL,
  slug      TEXT        UNIQUE,
  title     TEXT        NOT NULL,
  votes     INT         NOT NULL DEFAULT 0
);


CREATE INDEX indexThreadsOnForum ON threads (lower(forum));
CREATE UNIQUE INDEX indexThreadsOnSlug ON threads (LOWER(slug));


CREATE TABLE IF NOT EXISTS posts (
  id        BIGSERIAL   PRIMARY KEY,
  author    TEXT        NOT NULL,
  created   TIMESTAMP   NOT NULL,
  forum     TEXT        NOT NULL ,
  isEdited BOOLEAN     DEFAULT FALSE,
  message   TEXT,
  parent    BIGINT,
  path      BIGINT []   NOT NULL,
  threadId BIGINT REFERENCES threads (id) NOT NULL
);


CREATE INDEX indexPostsOnPath ON posts USING GIN (path);
CREATE INDEX indexPostsOnThreadIdAndId ON posts(threadId, id);
CREATE INDEX indexPostsOnParent ON posts (parent);
CREATE INDEX indexPostsOnThreadId ON posts (threadId);
CREATE INDEX indexPostsThreadPathParent ON posts(threadId, parent, path);
CREATE INDEX indexPostsOnThreadIdAndPathAndId ON posts (threadId, path ,id);


CREATE TABLE IF NOT EXISTS votes (
  userId   BIGINT REFERENCES users (id)   NOT NULL,
  threadId BIGINT REFERENCES threads (id) NOT NULL,
  voice     INT                           NOT NULL
);


CREATE UNIQUE INDEX indexVotesOnUserIdAndThreadId ON votes (userId, threadId);


CREATE FUNCTION voteInsert()
  RETURNS TRIGGER AS '
BEGIN
  UPDATE threads
  SET
    votes = votes + NEW.voice
  WHERE id = NEW.threadId;
  RETURN NULL;
END;
' LANGUAGE plpgsql;

CREATE TRIGGER onVoteInsert
AFTER INSERT ON votes
FOR EACH ROW EXECUTE PROCEDURE voteInsert();


CREATE FUNCTION voteUpdate()
  RETURNS TRIGGER AS '
BEGIN

  IF OLD.voice = NEW.voice
  THEN
    RETURN NULL;
  END IF;

  UPDATE threads
  SET
    votes = votes + CASE WHEN NEW.voice = -1
      THEN -2
                    ELSE 2 END
  WHERE id = NEW.threadId;
  RETURN NULL;
END;
' LANGUAGE plpgsql;

CREATE TRIGGER onVoteUpdate
AFTER UPDATE ON votes
FOR EACH ROW EXECUTE PROCEDURE voteUpdate();


CREATE TABLE IF NOT EXISTS forumMembers (
  userId  BIGINT REFERENCES users (id),
  forumId BIGINT REFERENCES forums (id)
);


CREATE INDEX indexForumMembersOnUserId ON forumMembers (userId);
CREATE INDEX indexForumMembersOnForumId ON forumMembers (forumId);
CREATE INDEX indexForumMembersOnUserIdForumId ON forumMembers (userId, forumId);


CREATE OR REPLACE FUNCTION forumMembersUpdate()
  RETURNS TRIGGER AS '
BEGIN
  INSERT INTO forumMembers (userId, forumId) VALUES ((SELECT id FROM users WHERE LOWER(NEW.author) = LOWER(nickname)),
                                                        (SELECT id FROM forums WHERE LOWER(NEW.forum) = LOWER(slug)));
  RETURN NULL;
END;
' LANGUAGE plpgsql;


CREATE TRIGGER onPostInsert
AFTER INSERT ON posts
FOR EACH ROW EXECUTE PROCEDURE forumMembersUpdate();


CREATE TRIGGER onThreadInsert
AFTER INSERT ON threads
FOR EACH ROW EXECUTE PROCEDURE forumMembersUpdate();
