const config = require('../../config');

const host = 'localhost';

function getClientPort() {
    const client = config.get('hosts.client')
    return client.port;
}

function getClientBaseUrl() {
    const client = config.get('hosts.client')
    const url = getProtocol(client.secure) + host + ':' + client.port
    return url;
}

function getServerPort() {
    const server = config.get('hosts.server')
    return server.port;
}

function getServerBaseUrl() {
    const server = config.get('hosts.server')
    const url = getProtocol(server.secure) + host + ':' + server.port
    return url;
}

function getProtocol(secure) {
    if (secure) {
        return 'https://';
    }

    return 'http://';
}

module.exports = {
    getClientPort, getClientBaseUrl, getServerPort, getServerBaseUrl
}
