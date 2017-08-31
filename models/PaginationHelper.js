const { QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('./constants')

const POST_GET_BASE = 'http://localhost:3000/api/v1/posts'

// Helper function to generate the pagination object
// While getting pagination we are removing the last excess item, look for a good place to move
function getFeedPagination(query, data) {
    if(data.length == 0)
        return {}
    let pagination = {}
    if (query.query == QUERY_BY_DATE_RANGE) {
        // Range query, (E.g, give me feeds for range, from(since) -> to(until)
        // No pagination, remove last we are always querying one extra item
        if (data.length == query.limit + 1) {
            data.pop()
        }
    } else if (query.query == QUERY_BY_DATE_BACKWARD) {
        // Backward query, (E.g, give me 3 feeds, ends at until
        // We may have next page here we have to use 'until' here   
        pagination.previous = POST_GET_BASE + '?limit=' + query.limit + "&since=" + data[0].date.getTime()
        if (data.length == query.limit + 1) {
            let lastFeed = data.pop()
            pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + lastFeed.date.getTime()
        }
    } else if (query.query == QUERY_BY_DATE_FORWARD) {
        // Forward query, (E.g, give me 3 feeds, starts at since
        // We may have prev page here
        pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + data[0].date.getTime()
        if (data.length == query.limit + 1) {
            let lastFeed = data.pop()
            pagination.previous = POST_GET_BASE + '?limit=' + query.limit + "&since=" + lastFeed.date.getTime()
        }
    } else {
        // This is the 'default' query, (E.g, start at current date and get 3 feeds)
        // We may have next page here
        if (data.length == query.limit + 1) {
            let lastFeed = data.pop()
            pagination.next = POST_GET_BASE + '?limit=' + query.limit + "&until=" + lastFeed.date.getTime()
        }
    }

    return pagination
}

module.exports = {
    getFeedPagination
}