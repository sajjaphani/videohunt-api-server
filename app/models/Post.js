var mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var PostSchema = new Schema({
  'url': { type: String, unique: true },
  'title': { type: String },
  'author': String,
  'author_url': String,
  'provider_name': String,
  'description': String,
  'thumbnail_url': String,
  'thumbnail_width': Number,
  'thumbnail_height': Number,
  'embed': String, // Embedded content
  'comments': [ObjectId], // list of comments on this
  'likes': [ObjectId], // Users who liked this
  'userId': ObjectId,
  'language': String,
  'categories': [ObjectId],
  'postedOn': {
    type: Date,
    default: Date.now
  }
});

PostSchema.index({ url: 'text', title: 'text' });

// Find Feed Posts
PostSchema.statics.findFeedPosts = function (query) {
  console.log(query);
  const skip = query.skip || 0;
  const limit = query.limit || 1;

  return this.find().sort({ 'postedOn': -1 }).skip(skip).limit(limit).exec()
}

// Find posts for topic
PostSchema.statics.findPostsForTopic = function (query) {
  const skip = query.skip || 0;
  const limit = query.limit || 1;
  const filter = query.filter;
  return this.find(filter).sort({ 'postedOn': -1 }).skip(skip).limit(limit).exec()
}

// This will handle computing posts feed for a single postId or an array of ids
PostSchema.statics.getPosts = function (postIds, query) {
  if (!Array.isArray(postIds))
    postIds = [postIds]
  let queryObj = {
    '_id': {
      $in: postIds
    }
  }

  return this.find(queryObj).exec();
}

// Find a post given its id
PostSchema.statics.findPostById = function (postId) {
  return this.findById(postId).exec();
};

PostSchema.statics.findAndUpdate = function (postId, update) {
  const options = { safe: true, upsert: true, new: true };
  return this.findByIdAndUpdate(postId, update, options).exec()
};

// Add or remove the user from like data (toggle like)
PostSchema.statics.updateLike = function (postId, userId, liked) {
  let options = { safe: true, new: true }
  let updateObj = liked ? { $addToSet: { likes: userId } } : { $pull: { likes: userId } }
  return this.findByIdAndUpdate(postId, updateObj, options).exec()
    .then(function (post) {
      return { liked: liked, userId: userId, postId: post._id }
    });
};

PostSchema.statics.addPost = function (postData, user) {
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
    embed: postData.embed,
    userId: user.id,
    categories: postData.categories,
    language: postData.language,
  };

  return new this(newPost).save();
};

PostSchema.statics.findPostByUrl = function (url) {
  let queryObj = {
    'url': url
  }

  return this.findOne(queryObj).exec();
};

PostSchema.statics.findPosts = function (text) {
  return this.find(
    { $text: { $search: text } },
    { score: { $meta: "textScore" } }
  ).sort({ postedOn: 1, score: { $meta: "textScore" } }).exec();
};

mongoose.model('Post', PostSchema);
