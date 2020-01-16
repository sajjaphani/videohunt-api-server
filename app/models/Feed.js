var mongoose = require('mongoose');

const { getFeedQueryObject } = require('./helpers/QueryObjectHelper')

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.set('useFindAndModify', false);

var FeedSchema = new Schema({
    'date': {
        type: Date,
        required: true,
        unique: true
    }, // a day (not time stamp included) (Sample: 2017-7-14, YYYY-MM-DD)
    'posts': [ObjectId] // posts on a date
});

FeedSchema.statics.getFeed = function (query) {
    let feedQueryObj = getFeedQueryObject(query, 'date');
    return this.find(feedQueryObj).sort({ 'date': -1 }).limit(query.limit + 1).exec();
};

FeedSchema.statics.updateFeed = function (query, update) {
    const options = { upsert: true, new: true };
    return this.findOneAndUpdate(query, update, options).exec()
};

mongoose.model('Feed', FeedSchema);