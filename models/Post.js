var mongoose = require('mongoose');

const { getLikeData, getCommentData } = require('./ModelHelper')
const { API_BASE } = require('../routes/constants')

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
  'url': { type: String, unique: true },  // URL of this video post
  'title': String, // Title of the post
  'author': String, // Subtitle if any
  'author_url': String,
  'provider_name': String,
  'description': String,
  'thumbnail_url': String,
  'thumbnail_width': Number,
  'thumbnail_height': Number,
  'html': String, // Embedded content
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
PostSchema.statics.getPostsPromise = function (postIds, query, user, models) {
  if (!Array.isArray(postIds))
    postIds = [postIds]
  let queryObj = {
    '_id': {
      $in: postIds
    }
  }
  return this.find(queryObj).exec().then(function (posts) {
    return models.Post.getPostsWrapperPromise(posts, query, user, models).then(function (feed) {
      return feed
    })
  })
}

// Given array of post objects, it returns the wrapper promise
PostSchema.statics.getPostsWrapperPromise = function (posts, query, user, models) {
  var userIds = []
  var userIdStrings = []
  var commentIds = []
  var postFeed = posts.reduce(function (postsObj, post) {
    let postObj = post.toJSON()
    postObj.likes = getLikeData(post.likes, user)
    let commentPage = API_BASE + 'posts/' + post.id + '/comments'
    postObj.comments = getCommentData(post.comments, user, commentPage)
    postsObj[post._id] = postObj
    commentIds = commentIds.concat(post.comments)
    if (userIdStrings.indexOf(post.userId.toString()) === -1) {
      userIdStrings.push(post.userId.toString())
      userIds.push(post.userId)
    }
    return postsObj
  }, {});
  return models.User.getUserFeedPromise(userIds).then(function (userFeed) {
    return { posts: postFeed, users: userFeed }
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
      newComment.replies = getCommentData([], user, null)

      return newComment
    })
  })
}

// Get commnets for the given postId,
PostSchema.statics.getCommentsPromise = function (postId, query, user, models) {
  return this.findById(postId).exec().then(function (post) {
    return models.Comment.getCommentsPromise(post.comments, query, user, models).then(function (feed) {

      return feed
    })
  })
}

// Add a new video post
// TODO we need to check whether there is any existing
PostSchema.statics.addPostPromise = function (postData, user, models) {
  let newPost = {
    url: postData.url,
    title: postData.title,
    author: postData.author,
    author_url: postData.author_url,
    provider_name: postData.provider_name,
    description: postData.description,
    thumbnail_url: postData.thumbnail_url,
    thumbnail_width: postData.thumbnail_width,
    thumbnail_height: postData.thumbnail_height,
    html: postData.html,
    userId: user.id,
    category: postData.category,
    language: postData.language,
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
      postObj.comments = getCommentData([], user, null)

      return { feedKey: date, post: postObj };
    })
  })
}

PostSchema.statics.findPostByUrl = function (url) {
  let queryObj = {
    'url': url
  }
  return this.findOne(queryObj).exec().then(function (video) {
    return video
  })
}

module.exports = PostSchema