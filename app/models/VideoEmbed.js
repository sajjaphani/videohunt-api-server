// This schema temporarily holds the embed content.
// Once the post is reviewed, it will be moved to an actual post
var mongoose = require('mongoose');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var VideoEmbedSchema = new Schema({
  'url': { type: String, unique: true },
  'type': String,
  'version': String,
  'title': String,
  'author': String,
  'author_url': String,
  'provider_name': String,
  'description': String,
  'thumbnail_url': String,
  'thumbnail_width': Number,
  'thumbnail_height': Number,
  'html': String,
  'userId': ObjectId, // User who submitted this
});

VideoEmbedSchema.index({ url: 1 }, { unique: true });

// Find a video given its url
VideoEmbedSchema.statics.findVideoByUrl = function (url, user) {
  let queryObj = {
    'url': url
  }
  return this.findOne(queryObj).exec().then(function (video) {
    return video
  });
}

// Add a new video post
VideoEmbedSchema.statics.addVideoEmbedPromise = function (oembedData) {
  // console.log(oembedData)
  return new this(oembedData).save()
    .then(function (video) {
      return video
    });
}

mongoose.model('VideoEmbed', VideoEmbedSchema);
