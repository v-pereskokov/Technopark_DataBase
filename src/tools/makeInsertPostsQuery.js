const makeInsertPostsQuery = (posts, thread) => {
  let query = `INSERT INTO posts
    (id, author, forum, isEdited, message, parent, path, threadId)
    VALUES `;

  const length = posts.length;

  for (let post in posts) {
    query += `(nextval('posts_id_seq'), (SELECT u.nickname FROM users u WHERE LOWER(u.nickname) = LOWER('${posts[post].author}')), 
      '${thread.forum}', 
      ${posts[post].isEdited || 'FALSE'}, '${posts[post].message}', ${posts[post].parent ? `${posts[post].parent}` : 'NULL'}, 
      (SELECT path FROM posts WHERE id = ${posts[post].parent ? `${posts[post].parent}` : 'NULL'}) || currval('posts_id_seq')::BIGINT, 
      ${+thread.id})${post < length - 1 ? ',' : ''}`;
  }

  return query + ' RETURNING id::int, author, created, forum, isedited as "isEdited", message, parent::int, path, threadId::int as "thread"';
};

export default makeInsertPostsQuery;
