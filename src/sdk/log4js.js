const log4js = require('log4js');
log4js.configure({
    appenders: {
        consoleAppender: {
            type: 'console', layout: {
                type: 'pattern', pattern: '%d %[%p%] %c %f{1}:%l %m'
            }
        }
    },
    categories: {
        default: {
            appenders: ['consoleAppender'], level: 'info', enableCallStack: true
        },
    },
});
const logger = log4js.getLogger('print-service');
module.exports = logger;