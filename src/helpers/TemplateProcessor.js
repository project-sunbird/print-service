
var async = require("async");
var FileExtactor = require('./FileExtractor')
var DownloadManager = require('./DownloadManager')
const filemanager = require('../FileManager')

const fs = require('fs')



class TemplateProcessor {

    constructor(downloadParams) {
        this.downloadParams = downloadParams;
    }

    processTemplate() {
        var downloadManager = new DownloadManager(this.downloadParams)
        var fileExtractor = new FileExtactor(this.downloadParams)
        var htmlAbsFilePath = filemanager.getAbsolutePath(this.downloadParams.getHtmlPath())
        var fileCheckResult = this.checkFileExists(htmlAbsFilePath)
        if(!fileCheckResult) {
            return new Promise(function (resolve, reject) {
                async.waterfall([
                    (callback) => {
                        downloadManager.downloadFile(callback);
                    },
                    (callback2) => {
                        fileExtractor.extractZipFile(callback2)
                    }

                ], (err, result) => {
                    if (!err) {
                        console.log("index.html file absolute path:", result)
                        resolve(result)
                    }
                    else {
                        console.log("error occurred in processing template", err);
                        throw (err)
                    }
                });
            })
        }
        else {
            return new Promise(function (resolve, reject) {
                resolve(htmlAbsFilePath);
            })
        }
    }

    checkFileExists(htmlAbsFilePath) {
        if (fs.existsSync(htmlAbsFilePath)) {
            console.log('Found file in cache skip downloading..');
            return true;
        }
        console.log('No file found in cache!!');
        return false;
    }
}

module.exports = TemplateProcessor