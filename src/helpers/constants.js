module.exports.apiIds = Object.freeze({
    version: '1.0',
    PRINT_API_ID: 'api.print.preview.generate',
    HEALTH_API_ID: 'api.health',
})
module.exports.responseCodes = Object.freeze({
    SUCCESS: {
        name: 'OK',
        code: 200
    },
    CLIENT_ERROR: {
        name: 'CLIENT_ERROR',
        code: 400
    },
    SERVER_ERROR: {
        name: 'SERVER_ERROR',
        code: 500
    },
    NOT_FOUND: {
        name: 'RESOURCE_NOT_FOUND',
        code: 404
    }
})


module.exports.argsConfig = {

    PROD_MODE: {
        executablePath: 'google-chrome-unstable',
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    },

    DEBUG_MODE:
    {
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    }

}
