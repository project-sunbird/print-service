const fs = require('fs');
const Mapper = require('./Mapper')
const encodingType = 'utf8';
const logger = require('../sdk/log4js');


class HtmlGenerator{

    constructor(htmlFilePath, request){
        this.htmlFilePath=htmlFilePath;
        this.request= request;
    }


    generateTempHtmlFile(){
    var startTime = Date.now();
    var htmlFile = fs.readFileSync(this.htmlFilePath,encodingType);
    var mapper = new Mapper(htmlFile, this.request.getContextMap());
    var mappedHtml = mapper.replacePlaceholders();
    var mappedHtmlFilePath = this.getReqIdHtmlFilePath();
    fs.writeFileSync(mappedHtmlFilePath,mappedHtml)
    logger.debug("HtmlGenerator:generateTempHtmlFile:file written successfully in ms:", Date.now()-startTime)
    return mappedHtmlFilePath;
    }

    getReqIdHtmlFilePath(){
    var tempHtmlFilePath = this.htmlFilePath.replace("index.html", this.request.getRequestId()+".html")
    logger.info("HtmlGenerator:getReqIdHtmlFilePath:the temp filepath formed is", tempHtmlFilePath)
    return tempHtmlFilePath;
    }

}
module.exports = HtmlGenerator;