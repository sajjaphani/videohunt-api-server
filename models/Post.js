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

PostSchema.statics.findPosts = function (posts, callback) {
    this.find({
                '_id': {
                    $in: posts
                }
            }, function (err, posts) {
              callback(err, posts)
          })
}

PostSchema.statics.findPostById = function (postId, callback) {
    this.findById(req.params.postId, function (err, post) {
            callback(err, post)
        })
}

module.exports = PostSchema