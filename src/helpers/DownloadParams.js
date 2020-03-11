class DownloadParams{

constructor(sourceUrl) {
    this.sourceUrl = sourceUrl;
}

 getDownloadPath() {
    const fileName=this.getFileName()
    const downloadPath= "conf/".concat(fileName)
    console.log("Downloadpath forms:", downloadPath)
    return downloadPath;
 }


getSourceUrl(){
    return this.sourceUrl;
}

getFileExtractToPath(){
    const extactToPath= "conf/".concat(this.getFileName().replace(".zip","/"))
    console.log("DownloadParams:getFileExtractToPath got:",extactToPath)
    return extactToPath
}


getHtmlPath(){
    const htmlPath= "conf/".concat(this.getFileName().replace(".zip","/index.html"))
    console.log("index.html file path is:", htmlPath)
    return htmlPath;


}

getFileName(){
    return this.sourceUrl.substring(this.sourceUrl.lastIndexOf('/') + 1);
}

}

module.exports = DownloadParams;