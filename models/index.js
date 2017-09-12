var UserSchema = require('./User')
var PostSchema = require('./Post')
var CommentSchema = require('./Comment')
var FeedSchema = require('./Feed')
var VideoEmbedSchema = require('./VideoEmbed')

var models = function (db) {
    var User = db.model('User', transform(UserSchema));
    var Post = db.model('Post', transform(PostSchema));
    var Comment = db.model('Comment', transform(CommentSchema));
    var Feed = db.model('Feed', transform(FeedSchema));
    var VideoEmbed = db.model('VideoEmbed', transform(VideoEmbedSchema));

    return {
        User: User,
        Post: Post,
        Comment: Comment,
        Feed: Feed,
        VideoEmbed: VideoEmbed
    };
}

function transform(Schema) {
    Schema.set('toObject', { virtuals: true })
    Schema.set('toJSON', { virtuals: true })

    if (!Schema.options.toJSON)
        Schema.options.toJSON = {};

    Schema.options.toJSON.transform = function (doc, ret, options) {
        delete ret._id
        delete ret.__v
    }

    Schema.options.toJSON.virtuals = true;

    Schema.options.toObject.transform = function (doc, ret, options) {
        delete ret._id
    }

    Schema.options.toObject.virtuals = true;

    return Schema
}

module.exports = models;

