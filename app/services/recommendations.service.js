var mongoose = require('mongoose');

var Post = mongoose.model('Post');

const { getCaterogies } = require('../util/categories');

// Currently the recommendations are based on fetching some items based on the categories of the post
// TODO we need to add real recommendation system
function findRecommendations(postId) {
    return Post.findById(postId)
        .then(post => {
            if (!post) {
                const validationError = {
                    status: 'error',
                    error: {
                        type: "NoSuchPost",
                        message: "There is no post exists for the given postId '" + postId + "'!",
                        code: 200201
                    }
                };
                return Promise.reject(validationError);
            }

            let categories = [];
            if (post.category) {
                categories.push(post.category);
            }
            if (post.categories) {
                categories = categories.concat(post.categories);
            }

            if (categories.length <= 1) {
                const randCategories = getRandomCategories();
                categories = categories.concat(randCategories);
            }

            return categories;
        }).then(categories => {
            const query = { categories: { $in: categories } };
            return Post.find(query).limit(15).exec()
            .catch((err) => {
                return [];
            });
        }).then(posts => {
            if (posts.length === 15) {
                return getUnique(posts).slice(0, 10);
            }

            return Post.aggregate([{ $sample: { size: 10 } }]).exec()
                .then(_posts => {
                    return getUnique(posts.concat(_posts)).slice(0, 10);
                })
        }).then(posts => {
            const _posts = posts.map(post => {
                return {
                    id: post._id, title: post.title, author: post.author,
                    image: post.thumbnail_url, postedOn: post.postedOn,
                    views: getRandomviews()
                };
            });

            return _posts;
        });
}

function getUnique(posts) {
    return posts.filter((post, index, self) => {
        return self.findIndex(_post => _post._id === post._id) === index
    });
}
function getRandomCategories() {
    const categoryMap = getCaterogies();
    const categories = Object.keys(categoryMap);
    const firstItem = categories[Math.floor(Math.random() * categories.length)];
    const secondItem = categories[Math.floor(Math.random() * categories.length)];

    return [secondItem, firstItem];
}

function getRandomviews() {
    const min = 100, max = 999;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    findRecommendations
};
