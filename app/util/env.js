// Supplies the environment used by the API server
var path = require('path');

function environment() {

    /**
     * Host where the mongo db server is running
     */
    var MONGO_HOST = process.env.MONGO_HOST || 'localhost';

    /**
     * Port for mongo db server, default 27017
     */
    var MONGO_PORT = normalizeNumber(process.env.MONGO_PORT || '27017');

    /**
     * port to start node server, default 3000
     */
    var NODE_SERVER_PORT = normalizeNumber(process.env.NODE_SERVER_PORT || '8811');

    /**
     * Specific location to store log files.
     * Directory structure will be created if not exists.
     */
    var NODE_LOGS_LOCATION = process.env.NODE_LOGS_LOCATION || path.join(__dirname, '/../logs/');

    /**
     * environment should be set to 'production' in  deployment
     */
    var NODE_ENV = process.env.NODE_ENV || 'development';

    /**
     * session timeout for user session, default 600s = 10min
     */
    var USER_SESSION_TIMEOUT = normalizeNumber(process.env.USER_SESSION_TIMEOUT || '600');

    /**
     * Mongo db database name
     */
    var MONGO_DB_NAME = 'videohunt';

    /**
     * Mongo db connection Url
     */
    var MONGO_CONNECTION_URL = dbConnectionUrl();

    /**
     * Normalize value into a number
     */
    function normalizeNumber(val) {
        var num = parseInt(val, 10);

        return num;
    }

    /**
     * Get the MongoDB connection Url
     */
    function dbConnectionUrl() {
        var connUrl = 'mongodb://' + MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DB_NAME;

        return connUrl;
    }

    /**
     * Exposed environment.
     * 
     * @public
     */
    var environment = {
        NODE_SERVER_PORT: NODE_SERVER_PORT,
        NODE_LOGS_LOCATION: NODE_LOGS_LOCATION,
        NODE_ENV: NODE_ENV,
        USER_SESSION_TIMEOUT: USER_SESSION_TIMEOUT,
        MONGO_DB_NAME: MONGO_DB_NAME,
        MONGO_CONNECTION_URL: MONGO_CONNECTION_URL
    };

    return environment;
}

module.exports = environment()