const makeInsertPostsQuery = (posts, forumId) => {
  let create = [];
  let query = ' INSERT INTO posts (id, author, message, parent, thread, forum, created, path) VALUES';
  for (let i = 0; i < posts.length; i += 1) {
    query += ' (' + posts[i].id + ',\'' + posts[i].author + '\',\'' + posts[i].message + '\',' +
      posts[i].parent + ',' + posts[i].thread + ',\'' + posts[i].forum + '\', $' + parseInt(i + 1) + ','
      + ' array_append(ARRAY[';
    if (posts[i].path.length > 0) {
      query += posts[i].path[0];
    }
    for (let j = 1; j < posts[i].path.length; j += 1) {
      query += ',' + posts[i].path[j];
    }
    query += ']::integer[], ' + posts[i].id + '))';
    if (i < posts.length - 1) {
      query += ',';
    }
    create.push(posts[i].created);
  }
  query += ';';
  query += 'insert into usersForums values';
  for (let i = 0; i < posts.length; i += 1) {
    query += ' (\'' + posts[i].author + '\',' + forumId + ')';
    if (i < posts.length - 1) {
      query += ',';
    }
  }

  return {query, create};
};

export default makeInsertPostsQuery;
