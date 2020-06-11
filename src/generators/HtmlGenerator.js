const fs = require('fs');
const Mapper = require('./Mapper')
const encodingType = 'utf8';
const logger = require('../sdk/log4js');


/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */
class HtmlGenerator{

    constructor(htmlFilePath, request,fileExtension){
        this.htmlFilePath=htmlFilePath;
        this.request= request;
        this.fileExtension = fileExtension;
    }


    generateTempHtmlFile(){
    var startTime = Date.now();
    var htmlFile = fs.readFileSync(this.htmlFilePath,encodingType);
    var mapper = new Mapper(htmlFile, this.request.getContextMap());
    var mappedHtml = mapper.replacePlaceholders();
    var mappedHtmlFilePath = this.getReqIdHtmlFilePath(this.fileExtension);
    fs.writeFileSync(mappedHtmlFilePath,mappedHtml)
    logger.debug("HtmlGenerator:generateTempHtmlFile:file written successfully in ms:", Date.now()-startTime)
    return mappedHtmlFilePath;
    }

    getReqIdHtmlFilePath(){
    var tempHtmlFilePath = this.htmlFilePath.replace("index."+this.fileExtension, this.request.getRequestId()+"."+this.fileExtension)
    logger.info("HtmlGenerator:getReqIdHtmlFilePath:the temp filepath formed is", tempHtmlFilePath)
    return tempHtmlFilePath;
    }

}
module.exports = HtmlGenerator;