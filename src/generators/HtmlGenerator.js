const fs = require('fs');
const Mapper = require('./Mapper')
const ENCODING = 'utf8';

class HtmlGenerator{

    constructor(htmlFilePath, request){
        this.htmlFilePath=htmlFilePath;
        this.request= request;
    }


    generateTempHtmlFile(){
    var htmlFile = fs.readFileSync(this.htmlFilePath,ENCODING);
    var mapper = new Mapper(htmlFile, this.request.getContextMap());
    var mappedHtml = mapper.replacePlaceholders();
    var mappedHtmlFilePath = this.getReqIdHtmlFilePath();
    fs.writeFileSync(mappedHtmlFilePath,mappedHtml)
    console.log("file written successfully")
    return mappedHtmlFilePath;
    }

    getReqIdHtmlFilePath(){
    var tempHtmlFilePath = this.htmlFilePath.replace("index.html", this.request.getRequestId()+".html")
    console.log("the temp filepath formed is", tempHtmlFilePath)
    return tempHtmlFilePath;
    }

}
module.exports = HtmlGenerator;