var mongoose = require('mongoose');

var Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var FeedCategorySchema = new Schema({
  'name': { type: String, unique: true },
  'description': String,
  'image': String,
  'categories': [ObjectId]
});

FeedCategorySchema.index({ name: 1 }, { unique: true });

mongoose.model('FeedCategory', FeedCategorySchema);
