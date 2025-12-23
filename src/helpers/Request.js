



/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */

 

class Request {

    constructor(contextMap, htmlTemplate, requestId, storageParmas) {
        this.contextMap = contextMap;
        this.htmlTemplate = htmlTemplate;
        this.requestId = requestId;
        this.storageParmas= storageParmas;
    }

    getContextMap() {
        return this.contextMap;
    }

    getStorageParams(){
        return this.storageParmas;
    }

    getRequestId() {
        return this.requestId;
    }
    getHtmlTemplate(){
        return this.htmlTemplate;
    }

}

module.exports = Request;