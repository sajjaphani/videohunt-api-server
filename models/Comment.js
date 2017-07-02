var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    'text': String, // comments of the post
    'likes': [ObjectId], // users who liked
    'comments': [ObjectId], // list of comments on this
    'commentedOn': {
        type: Date,
        default: Date.now
    }
});

module.exports = CommentSchema