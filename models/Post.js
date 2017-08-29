var mongoose = require('mongoose');

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