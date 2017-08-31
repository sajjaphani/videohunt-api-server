var mongoose = require('mongoose');

const { getLikeData, getCommentData } = require('./ModelHelper')

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
  'title': String, // Title of the post
  'subtitle': String, // Subtitle if any
  'url': { type: String, unique: true },  // URL of this video post
  'comments': [ObjectId], // list of comments on this
  'likes': [ObjectId], // Users who liked this
  'userId': ObjectId, // User who posted this
  'language': String, // Primary Language
  'category': String, // Primary Category
  'postedOn': {
    type: Date,
    default: Date.now
  } // posted_time may be appropriate
});

PostSchema.index({ url: 1 }, { unique: true });

// Find posts given their ids
PostSchema.statics.findPosts = function (posts, callback) {
  this.find({
    '_id': {
      $in: posts
    }
  }, function (err, posts) {
    callback(err, posts)
  })
}

// This will handle computing posts feed for a single postId or an array of ids
PostSchema.statics.getPostsPromise = function (postIds, user, models, callback) {
  if (!Array.isArray(postIds))
    postIds = [postIds]
  let queryObj = {
    '_id': {
      $in: postIds
    }
  }
  return this.find(queryObj).exec().then(function (posts) {
    // console.log(posts)
    var userIds = []
    var userIdStrings = []
    var commentIds = []
    var postFeed = posts.reduce(function (postsObj, post) {
      let postObj = post.toJSON()
      postObj.likes = getLikeData(post.likes, user)
      postObj.comments = getCommentData(post.comments, user)
      postsObj[post._id] = postObj
      commentIds = commentIds.concat(post.comments)
      if (userIdStrings.indexOf(post.userId.toString()) === -1) {
        userIdStrings.push(post.userId.toString())
        userIds.push(post.userId)
      }
      return postsObj
    }, {});
    return models.Comment.getCommentsPromise(commentIds).then(function (comments) {
      let commentsFeed = comments.reduce(function (comments, comment) {
        let commentObj = comment.toJSON()
        commentObj.likes = getLikeData(comment.likes, user)
        commentObj.replies = getCommentData(comment.comments, user)
        delete commentObj.comments

        comments[comment._id] = commentObj
        if (userIdStrings.indexOf(comment.userId.toString()) === -1) {
          userIdStrings.push(comment.userId.toString())
          userIds.push(comment.userId)
        }
        return comments;
      }, {});
      return { posts: postFeed, users: userIds, comments: commentsFeed }
    })
  }).then(function (feed) {
    return models.User.getUsersPromise(feed.users).then(function (users) {
      var userFeed = users.reduce(function (users, user) {
        users[user._id] = user
        return users
      }, {});
      feed.users = userFeed
      return feed
    })
  })
}

// Find a post given its id
PostSchema.statics.findPostById = function (postId, callback) {
  this.findById(postId, function (err, post) {
    callback(err, post)
  })
}

// Add or remove the user from like data (toggle like)
PostSchema.statics.updateLike = function (postId, userId, liked, callback) {
  let options = { safe: true, new: true }
  let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
  this.findByIdAndUpdate(postId, updateObj, options, function (err, post) {
    callback(err, post)
  })
}

module.exports = PostSchema