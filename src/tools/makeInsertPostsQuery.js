const makeInsertPostsQuery = posts => {
  let query = `INSERT INTO posts
    (id, author, forum, isEdited, message, parent, path, threadId)
    VALUES `;

  for (let post of posts) {
    query += `(nextval('posts_id_seq'), '${post.author}', 
      '${post.forum}', ${post.isEdited || 'FALSE'}, '${post.message}', ${post.parent ? `${post.parent}` : 'NULL'}, 
      (SELECT path FROM posts WHERE id = ${post.parent ? `${post.parent}` : 'NULL'}) || currval('posts_id_seq')::BIGINT, 
      ${post.thread}),`;
  }

  return query.slice(0, -1) + ' RETURNING id::int, author, created, forum, isedited as "isEdited", message, parent::int, path, threadId::int as "thread"';
};

export default makeInsertPostsQuery;
