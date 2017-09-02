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
PostSchema.statics.findPosts = function (postIds, callback) {
  this.find({
    '_id': {
      $in: postIds
    }
  }, function (err, posts) {
    callback(err, posts)
  })
}

// This will handle computing posts feed for a single postId or an array of ids
PostSchema.statics.getPostsPromise = function (postIds, user, models) {
  if (!Array.isArray(postIds))
    postIds = [postIds]
  let queryObj = {
    '_id': {
      $in: postIds
    }
  }
  return this.find(queryObj).exec().then(function (posts) {
    // console.log(posts)
    return models.Post.getPostsWrapperPromise(posts, user, models).then(function (feed) {
      return feed
    })
  }).then(function (feed) {
    return models.User.getUserFeedPromise(feed.users).then(function (userFeed) {
      feed.users = userFeed
      return feed
    })
  })
}

// Given array of post objects, it returns the wrapper promise
PostSchema.statics.getPostsWrapperPromise = function (posts, user, models) {
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
  return models.Comment.getCommentsPromise(commentIds, user).then(function (feed) {
    console.log('feed', feed)
    feed.users.forEach(function (userId) {
      if (userIdStrings.indexOf(userId.toString()) === -1) {
        userIdStrings.push(userId.toString())
        userIds.push(userId)
      }
    })
    return { posts: postFeed, users: userIds, comments: feed.comments }
  })
}

// Find a post given its id
PostSchema.statics.findPostById = function (postId, callback) {
  this.findById(postId, function (err, post) {
    callback(err, post)
  })
}

// Add or remove the user from like data (toggle like)
PostSchema.statics.updateLikePromise = function (postId, userId, liked) {
  let options = { safe: true, new: true }
  let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
  return this.findByIdAndUpdate(postId, updateObj, options).exec().then(function (post) {
    return { liked: liked, userId: userId, postId: post._id }
  })
}

// Add a new comment to an existing comment
PostSchema.statics.addCommentPromise = function (postId, replyText, user, models) {
  let newComment = {
    content: replyText,
    userId: user.id
  }
  return this.findById(postId).exec().then(function (post) {
    newComment.postId = post.id
    return new models.Comment(newComment).save()
  }).then(function (comment) {
    let updateObj = { $push: { comments: comment._id } }
    let options = { safe: true, upsert: true, new: true }
    return models.Post.findByIdAndUpdate(postId, updateObj, options).exec().then(function (updatedComment) {
      newComment.commentId = comment.id
      newComment.commentedOn = comment.commentedOn
      newComment.likes = getLikeData([], user)
      newComment.replies = getCommentData([], user)

      return newComment
    })
  })
}

// Get commnets for the given postId,
// TODO, paginate later
PostSchema.statics.getCommentsPromise = function (postId, query, user, models) {
  return this.findById(postId).exec().then(function (post) {
    return models.Comment.getCommentsPromise(post.comments, user).then(function (feed) {

      return feed
    })
  }).then(function (feed) {
    return models.User.getUserFeedPromise(feed.users).then(function (userFeed) {
      feed.users = userFeed
      return feed
    })
  })
}

// Add a new video post
// TODO we need to check whether there is any existing
PostSchema.statics.addPostPromise = function (postData, user, models) {
  let newPost = {
    title: postData.title,
    subtitle: postData.subtitle,
    url: postData.url,
    category: postData.category,
    language: postData.language,
    userId: user.id,
  }
  return new models.Post(newPost).save().then(function (post) {
    let date = new Date(post.postedOn.getTime());
    // We want date part only (set to its midnight)
    date.setHours(12, 0, 0, 0);
    var queryObj = { date: date },
      updateObj = { $push: { posts: post._id } },
      options = { upsert: true, new: true };
    // Find the feed document and update
    return models.Feed.findOneAndUpdate(queryObj, updateObj, options).exec().then(function (feedObj) {
      let postObj = post.toJSON()
      postObj.likes = getLikeData([], user)
      postObj.comments = getCommentData([], user)

      return { feedKey: date, post: postObj };
    })
  })
}

module.exports = PostSchema