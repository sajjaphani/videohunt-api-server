const { QUERY_BY_DATE_DEFAULT, QUERY_BY_DATE_RANGE, QUERY_BY_DATE_FORWARD, QUERY_BY_DATE_BACKWARD } = require('../models/constants')
// This function customizes the parameters for feed query
// Feed queries are based on date, not timestamp
function parseFeedQuery(params, givenLimit) {
    let parsedObj = parseQuery(params, givenLimit)

    parsedObj.until.setHours(12, 0, 0, 0)
    parsedObj.since.setHours(12, 0, 0, 0)

    return parsedObj
}

// This function parses the given parameters
function parseQuery(params, givenLimit) {
    let limit = parseInt(params.limit) || givenLimit
    limit = limit > 3 ? 3 : limit
    let today = new Date()
    let since = new Date(Number(params.since))
    since = since.getTime() > 0 ? since : today
    let until = new Date(Number(params.until))
    until = until.getTime() > 0 ? until : today
    let query = ''
    if (params.since && params.until) {
        query = QUERY_BY_DATE_RANGE
    } else if (params.until) {
        query = QUERY_BY_DATE_BACKWARD
    } else if (params.since) {
        query = QUERY_BY_DATE_FORWARD
    } else {
        // Default
        query = QUERY_BY_DATE_DEFAULT
    }

    let commentsSummary = params.comments_summary || 'true'
    let likesSummary = params.likes_summary || 'true'

    return {
        limit: limit,
        since: since,
        until: until,
        query: query,
        commentsSummary: commentsSummary == 'true',
        likesSummary: likesSummary == 'true'
    }
}

module.exports = { parseQuery: parseQuery, parseFeedQuery: parseFeedQuery }