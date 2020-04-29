var mongoose = require('mongoose');

var FeedCategory = mongoose.model('FeedCategory');
var Category = mongoose.model('Category');

function getFeedCategories() {
    return FeedCategory.find().exec().then(topics => {
        return topics.map(item => {
            return { id: item._id, name: item.name, image: item.image, description: item.description }
        });
    });
}

function getCategories() {
    const query = { canTag: true };
    return Category.find(query).exec().then(topics => {
        return topics.map(item => {
            return { id: item._id, name: item.name }
        });
    });
}

module.exports = {
    getFeedCategories, getCategories
};