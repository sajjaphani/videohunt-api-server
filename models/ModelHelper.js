
// Given a likes array and a user object, returns the summary representation of the data
function getLikeData(likes, user) {
  let canLike = user ? true : false
  let uid = user ? user.id : ''
  let hasLiked = likes.indexOf(uid) > -1 ? true : false

  return { data: likes, summary: { count: likes.length, can_like: canLike, has_liked: hasLiked } }
}

// Given a comments array and a user object, returns the summary representation of the data
// We are allowing all valid users to comment
function getCommentData(comments, user, page) {
  let canComment = user ? true : false
  let commentData = { data: [] }
  if (comments.length > 0)
    commentData.paging = { next: page }
  commentData.summary = { count: comments.length, can_comment: canComment }

  return commentData
}

module.exports = {
  getLikeData, getCommentData
}