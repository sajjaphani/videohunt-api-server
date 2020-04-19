var mongoose = require('mongoose');

var FeedCategory = mongoose.model('FeedCategory');
var Category = mongoose.model('Category');

function getFeedCategories() {
    return FeedCategory.find().exec();
}

function getCategories() {
    const query = {canTag: true};
    return Category.find(query).exec();
}

module.exports = {
    getFeedCategories, getCategories
};