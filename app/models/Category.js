var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  'name': { type: String, unique: true },
  'description': String,
  'image': String,
  'link': String,
  "canTag": Boolean
});

CategorySchema.index({ name: 1 }, { unique: true });

mongoose.model('Category', CategorySchema);
