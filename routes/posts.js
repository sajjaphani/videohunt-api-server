const router = require('express').Router();

// TODO we need to change this as we are supposed to use OAuth 2.0?
// TODO We need to omit __v before sending the resutls
// TODO can we extract the db access logic separately?
// GET all (most frequent) posts
// Currently we are fetching all (we should introduce pagination)
router.get("/", function (req, res) {
    let models = req.app.get('models')
    let pageNum = parseInt(req.query.page) || 0
    pageNum = pageNum <= 1 ? 1 : pageNum
    console.log('page: ' + pageNum)

    models.Feed.find({}, function (err, feeds) {
        if (err) {
            res.send(err)
        } else {
            var page = paginate(feeds, pageNum, 3);
            if (page.nextPage) {
                let link = req.originalUrl.split("?").shift()
                res.set("Link", link + "?page=" + page.nextPage);
            }
            //let feed = { 'feed': {}, 'posts': {} }

            var posts = []
            var feeds = {}
            page.pageData.forEach(function (feed) {
                feeds[feed.date.toISOString()] = feed.posts
                posts = posts.concat(feed.posts)
                //console.log(posts)
            });

            models.Post.find({
                '_id': {
                    $in: posts
                }
            }, function (err, posts) {
                if (err) {
                    console.error(err)
                    res.send(err)
                } else {
                    var users = []
                    var userids = []
                    var postFeed = posts.reduce(function (posts, post) {
                        posts[post._id] = post
                        if (userids.indexOf(post.userId.toString()) === -1) {
                            userids.push(post.userId.toString())
                            users.push(post.userId)
                        }

                        return posts
                    }, {});

                    models.User.find({
                        '_id': {
                            $in: users
                        }
                    }, function (err, users) {
                        if (err) {
                            console.error(err)
                            res.send(err)
                        } else {
                             var userFeed = users.reduce(function (users, user) {
                                users[user._id] = user
                                   return users
                            }, {});

                            res.json({ 'feed': feeds, 'posts': postFeed, 'users' : userFeed});
                        }
                    });
                }
            });

            // res.set("X-Total-Count", movieList.length);

        }
    }).sort({ 'date': -1 });

    // We can also identify whether next page exists or not by querying one more record than the page size
    // Then use 3 records if there are more than 3
    // We need to see both of the approaches and choose the better one

    // .skip(3 * (pageNum - 1))
    // .limit(3)

    // models.Post.find({}, function (err, posts) {
    //     if (err) {
    //         console.error(err)
    //         res.send(err)
    //     } else {
    //         let feed = { 'feed': {}, 'posts': {} }
    //         var result = posts.reduce(function (feed, post) {
    //             let map = feed['feed']
    //             let posts = feed['posts']
    //             posts[post._id] = post

    //             let key = new Date(post.postedOn).toDateString()
    //             options = map[key] || []
    //             options.push(post._id);
    //             map[key] = options

    //             return feed;
    //         }, feed);

    //         // We should filter the users based on selected posts
    //         models.User.find({}, function (err, users) {
    //             if (err || !users) {
    //                 console.log(err)
    //                 res.status(200).json(feed);
    //             }
    //             if (users) {
    //                 let userss = users.reduce(function (userFd, user) {
    //                     userFd[user._id] = user
    //                     return userFd
    //                 }, {});
    //                 console.log(userss)
    //                 feed['users'] = userss

    //                 res.status(200).json(feed);
    //             }
    //         });
    //     }
    // }).sort({ 'postedOn': -1 });
});

// GET the details of post (by its id)
// This will further accepts query parameters such as related/recommendations etc
router.get("/:postId", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(200).json({ post: req.params.postId });
});

// POST a new video
router.post('/', function (req, res) {
    let postData = req.body
    let models = req.app.get('models')
    // We are trying to find the one by email, can we get the same from the client?
    models.User.findOne({ email: postData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                // TODO remove date
                // let dt = new Date(Date.parse(postData.postedOn));
                let newPost = {
                    title: postData.title,
                    subtitle: postData.subtitle,
                    url: postData.url,
                    userId: user._id
                }
                new models.Post(newPost).save(function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        let date = new Date(post.postedOn.getTime());
                        // We want date part only (set to its midnight)
                        date.setHours(12, 0, 0, 0);
                        console.log(date)
                        var query = { date: date },
                            update = { $push: { posts: post._id } },
                            options = { upsert: true, new: true };
                        // Find the document
                        models.Feed.findOneAndUpdate(query, update, options, function (err, result) {
                            if (err) {
                                console.log(err)
                                res.send(err)
                            } else {
                                res.status(201).json(post);
                            }
                        });
                    }
                });
            } else {
                // Send validation error to user
            }
        }
    });

    // Location Header
    // https://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.30
    // Come to here means there should be some error
    // res.send('Something went wront... try again later')
});

// GET the comments for the post (by its id)
router.get("/:postId/comments", function (req, res) {
    // This queries comments for a single level only, we need to query 2 levels as it is our plan to proceed
    console.log('Comments for: ' + req.params.postId)
    let models = req.app.get('models');
    models.Post.findById(req.params.postId, function (err, post) {
        if (err) {
            console.log(err) // send the error to the user
            res.send(err)
        } else {
            if (post) {
                console.log(post)
                let comments = post.comments
                models.Comment.find({
                    _id: {
                        $in: comments
                    }
                }, function (err, comments) {
                    if (err) {
                        console.error(err)
                        res.send(err)
                    } else {
                        console.log(comments)
                        var result = comments.reduce(function (comments, comment) {
                            comments[comment._id] = comment
                            return comments;
                        }, {});
                        res.status(200).json(result);
                    }
                });
            } else {
                res.status(404).json({ messge: 'Not Found' });
            }
        }
    });
});

// POST a new comment on an existing post (by its id)
router.post("/:postId/comments", function (req, res) {
    let commentData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: commentData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                models.Post.findById(req.params.postId, function (err, post) {
                    if (err) {
                        console.log(err) // send the error to the user
                        res.send(err)
                    } else {
                        if (post) {
                            let newComment = {
                                content: commentData.content,
                                userId: user._id
                            }
                            new models.Comment(newComment).save(function (err, comment) {
                                if (err) {
                                    console.log(err) // send the error to the user
                                    res.send(err)
                                } else {
                                    console.log(comment)
                                    models.Post.findByIdAndUpdate(post._id,
                                        { $push: { comments: comment._id } },
                                        { safe: true, upsert: true, new: true },
                                        function (err, model) {
                                            if (err) {
                                                // We should rollback comment here
                                                console.log(err)
                                                res.send(err)
                                            } else {
                                                newComment.commentId = comment._id
                                                newComment.postId = post._id
                                                newComment.commentedOn = comment.commentedOn
                                                res.status(201).json(newComment)
                                            }
                                        }
                                    );
                                }
                            });
                        } else {
                            res.status(404).json({ messge: 'Not Found' });
                        }
                    }
                });
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

// POST Handle likes (like/unlike) for existing post (by its id)
router.post("/:postId/like", function (req, res) {
    let likeData = req.body
    let models = req.app.get('models');
    models.User.findOne({ email: likeData.user }, '_id', function (err, user) {
        if (err) {
            console.error(err);
            res.send(err)
        } else {
            if (user) {
                if (likeData.liked) {
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $addToSet: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, postId: result._id })
                        });
                } else {
                    console.log('here... ' + user._id)
                    models.Post.findByIdAndUpdate(req.params.postId,
                        { $pull: { likes: user._id } },
                        { safe: true, new: true }, function (err, result) {
                            if (err) {
                                console.log(err);
                            }
                            console.log("RESULT: " + result);
                            res.status(200).json({ liked: likeData.liked, userId: user._id, postId: result._id })
                        });
                }
            } else {
                res.status(401).json({ message: 'Unauthorized' });
            }
        }
    });
});

function paginate(sourceList, pageNum, pageSize) {
    var totalCount = sourceList.length;
    var lastPage = Math.ceil(totalCount / pageSize);
    var begin = (pageNum - 1) * pageSize;
    var end = begin + pageSize;
    var pageList = sourceList.slice(begin, end);
    return {
        pageData: pageList,
        nextPage: pageNum < lastPage ? pageNum + 1 : null,
        pageCount: totalCount
    }
}

module.exports = router;