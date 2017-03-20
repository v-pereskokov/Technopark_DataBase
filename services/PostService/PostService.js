const dataBase = require('../../database/DataBase');
const userService = require('../UserService/UserService');
const forumService = require('../ForumService/ForumService');
const threadService = require('../ThreadService/ThreadService');

class PostService {
  constructor() {
    this._query = '';
  }

  getPost(id) {
    this._query = `SELECT * FROM posts WHERE id = ${id}`;

    return dataBase.dataBase.oneOrNone(this._query);
  }

  getDetailedPost(post, related) {
    if (related) {
      let user = null;
      let forum = null;
      let thread = null;

      for (let relation of related) {
        switch (relation) {
          case 'user':
            return userService.userService.getUserByNickname({
              nickname: post.author
            })
              .then(data => {
                if (data.length) {
                  user = data[0];
                  return user;
                }
              });

          case 'forum':
            return forumService.forumService.getForum(post.forum)
              .then(data => {
                if (data.length) {
                  forum = data[0];
                }

                dataBase.dataBase.oneOrNone(`SELECT COUNT(*) FROM threads WHERE LOWER(forum) = LOWER(${forum.slug})`)
                  .then((data) => {
                    forum = data;
                    return forum;
                  });
              });

          case 'thread':
            return threadService.threadService.getThreadById(post.thread)
              .then(data => {
                if (data.length) {
                  thread = data[0];
                  return thread;
                }
              });

          default:
            break;
        }
      }
    }
  }

  updatePost(post, id) {
    this._query = `UPDATE posts SET \"message\" = ${post.message}`;

    this.getPost(id)
      .then(data => {
        if (!data.length) {
          return data;
        }

        if (data[0].message === post.message) {
          this._query += ', isEdited = TRUE';
        }

        this._query += `WHERE id = ${id};`;
        dataBase.dataBase.none(this._query);

        return this.getPost(id);
      });
  }
}

// public final PostDetailsModel getDetailedPostFromDb(final PostModel post, String[] related) {
//       if (relation.equals("thread")) {
//         ThreadService forumService = new ThreadService(jdbcTemplate);
//         List<ThreadModel> threads = forumService.getThreadInfoById(post.getThread());
//
//         if (!threads.isEmpty()) {
//           thread = threads.get(0);
//         }
//       }
//     }
//   }
//
//   return new PostDetailsModel(user, forum, post, thread);
// }
