const postService = require('../../services/PostService/PostService');

class PostController {
  constructor() {
  }

  getPost(ctx, next) {
    return new Promise(resolve => {
      let id = ctx.params.id;

      postService.postService.getPost(id)
        .then(data => {
          const related = ctx.request.query.related;
          let relatedCheck = {};

          if (related) {
            relatedCheck = {
              user: related.indexOf('user') !== -1,
              thread: related.indexOf('thread') !== -1,
              forum: related.indexOf('forum') !== -1
            };
          }

          let author = {
            about: '',
            email: '',
            fullname: '',
            nickname: data.author
          };

          let thread = {
            author: '',
            created: '',
            forum: data.forum,
            id: data.thread,
            message: '',
            slug: '',
            title: ''
          };

          let forum = {
            posts: 0,
            slug: '',
            threads: 0,
            title: '',
            user: ''
          };

          postService.postService.getDetailedPost({
            id: data.id,
            nickname: data.author,
            threadId: data.thread,
            forumSlug: data.forum
          })
            .then(post => {
              author.about = post.userabout;
              author.email = post.useremail;
              author.fullname = post.userfullname;

              thread.author = post.threadauthor;
              thread.created = post.threadcreated;
              thread.message = post.threadmessage;
              thread.slug = post.threadslug;
              thread.title = post.threadtitle;

              forum.posts = post.forumposts;
              forum.slug = post.forumslug;
              forum.threads = post.forumthreads;
              forum.title = post.forumtitle;
              forum.user = post.forumuser;

              let result = {
                post: JSON.parse(JSON.stringify(data)),
                forum: forum,
                thread: thread,
                author: author
              };

              if (related) {
                if (!relatedCheck.user) {
                  delete result.author;
                }

                if (!relatedCheck.thread) {
                  delete result.thread;
                }

                if (!relatedCheck.forum) {
                  delete result.forum;
                }
              }

              ctx.body = related ? result : {
                post: data
              };
              ctx.status = 200;
              resolve();
            })
            .catch(error => {
              ctx.body = error;
              ctx.status = 500;
              resolve();
            });
        })
        .catch(error => {
          ctx.body = error;
          ctx.status = 404;
          resolve();
        })
    });
  }

  updatePost(ctx, next) {
    return new Promise(resolve => {
      const id = ctx.params.id;
      const message = ctx.request.body.message;

      postService.postService.getPost(id)
        .then(data => {
          if (!isEmpty(message)) {
            if (message !== data.message) {
              return postService.postService.updatePost(message, id);
            } else {
              let d = JSON.stringify(data);
              d = JSON.parse(d);
              ctx.body = d;
              ctx.status = 200;
              resolve();
            }
          } else {
            let d = JSON.stringify(data);
            d = JSON.parse(d);
            ctx.body = d;
            ctx.status = 200;
            resolve();
          }
        })
        .then(() => {
          return postService.postService.getPost(id);
        })
        .then(data => {
          let d = JSON.stringify(data);
          d = JSON.parse(d);
          ctx.body = d;
          ctx.status = 200;
          resolve();
        })
        .catch(error => {
          ctx.body = 'Not found!';
          ctx.status = 404;
          resolve();
        });
    });
  }
}

function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

const postController = new PostController();

module.exports.postController = postController;
