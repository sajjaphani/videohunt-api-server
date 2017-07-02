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
  'postedOn': {
    type: Date,
    default: Date.now
  }
});

PostSchema.index({ url: 1 }, { unique: true });

module.exports = PostSchema