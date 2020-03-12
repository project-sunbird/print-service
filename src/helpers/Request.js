

class Request {

    constructor(contextMap, htmlTemplate, requestId) {
        this.contextMap = contextMap;
        this.htmlTemplate = htmlTemplate;
        this.requestId = requestId;
    }

    getContextMap() {
        return this.contextMap;
    }

    getRequestId() {
        return this.requestId;
    }
    getHtmlTemplate(){
        return this.htmlTemplate;
    }

}

module.exports = Request;