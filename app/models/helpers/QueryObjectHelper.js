const { QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('./constants')

function getFeedQueryObject(query, fieldName) {
    let queryObj = {}

    if (query.query == QUERY_BY_DATE_RANGE) {
        // Range query, (E.g, give me feeds for range, from(since) -> to(until)
        queryObj[fieldName] = { "$gte": query.since, "$lte": query.until }
    } else if (query.query == QUERY_BY_DATE_BACKWARD) {
        // Backward query, (E.g, give me 3 feeds, ends at until
        queryObj[fieldName] = { "$lte": query.until }
    } else if (query.query == QUERY_BY_DATE_FORWARD) {
        // Forward query, (E.g, give me 3 feeds, starts at since
        queryObj[fieldName] = { "$gte": query.since }
    } else {
        // This is the 'default' query, (E.g, start at current date and get 3 feeds)
        queryObj[fieldName] = { "$lte": query.since }
    }

    return queryObj
}

module.exports = {
    getFeedQueryObject
}