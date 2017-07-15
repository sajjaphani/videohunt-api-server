var UserSchema = require('./User')
var PostSchema = require('./Post')
var CommentSchema = require('./Comment')
var FeedSchema = require('./Feed')

var models = function (db) {
    var User = db.model('User', UserSchema);
    var Post = db.model('Post', PostSchema);
    var Comment = db.model('Comment', CommentSchema);
    var Feed = db.model('Feed', FeedSchema);

    return {
        User: User,
        Post: Post,
        Comment: Comment,
        Feed: Feed
    };
}

module.exports = models;

