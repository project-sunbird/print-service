
var async = require("async");
var FileExtactor = require('./FileExtractor')
var DownloadManager = require('./DownloadManager')



class TemplateProcessor {

    constructor(downloadParams) {
        this.downloadParams = downloadParams;
    }

    processTemplate() {
        var downloadManager = new DownloadManager(this.downloadParams)
        var fileExtractor= new FileExtactor(this.downloadParams)
        return new Promise(function(resolve, reject) {
        async.waterfall([
            (callback) => {
                downloadManager.downloadFile(callback);
            },
            (callback2) => {
                fileExtractor.extractZipFile(callback2)
            }

        ], (err, result) => {
            if(!err){
                console.log("index.html file absolute path:", result )
                resolve(result)
                // return result;
            }
            else{
                console.log("error occurred in processign template", err);
                throw(err)
            }
        });
    })
    }
}

module.exports = TemplateProcessor