var UserSchema = require('./User')
var PostSchema = require('./Post')
var CommentSchema = require('./Comment')

var models = function (db) {
    var User = db.model('User', UserSchema);
    var Post = db.model('Post', PostSchema);
    var Comment = db.model('Comment', CommentSchema);

    return {
        User: User,
        Post: Post,
        Comment: Comment
    };
}

module.exports = models;

