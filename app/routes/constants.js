const { getClientBaseUrl } = require('../util/host-utils');

const API_VERSION = 'v1';
const API_BASE = getClientBaseUrl() + '/api/' + API_VERSION + '/';

const SESSION_ERROR = {
    status: 'error',
    error: {
        code: 401,
        type: 'Authorization',
        message: 'Session expired or invalid'
    }
};

module.exports = {
    API_BASE, SESSION_ERROR
};