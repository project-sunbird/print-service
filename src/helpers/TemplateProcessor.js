const logger = require('../sdk/log4js');
var async = require("async");
var FileExtactor = require('./FileExtractor')
var DownloadManager = require('./DownloadManager')
const filemanager = require('../FileManager')
const fs = require('fs')



/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */


class TemplateProcessor {

    constructor(downloadParams, fileExtension) {
        this.downloadParams = downloadParams;
        this.fileExtension = fileExtension
    }

    processTemplate() {
        var downloadManager = new DownloadManager(this.downloadParams)
        var fileExtractor = new FileExtactor(this.downloadParams)
        var htmlAbsFilePath = filemanager.getAbsolutePath(this.downloadParams.getHtmlPath(this.fileExtension))
        var fileCheckResult = this.checkFileExists(htmlAbsFilePath)
        if(!fileCheckResult) {
            return new Promise(function (resolve, reject) {
                async.waterfall([
                    (callback) => {
                        downloadManager.downloadFile(fileExtension, callback);
                    },
                    (callback2) => {
                        fileExtractor.extractZipFile(fileExtension, callback2)
                    }

                ], (err, result) => {
                    if (!err) {
                        logger.info("TemplateProcessor:processTemplate:index.html file absolute path:", result)
                        resolve(result)
                    }
                    else {
                        logger.error("TemplateProcessor:processTemplate:index.html error occurred ",err);
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
            logger.info('TemplateProcessor:checkFileExixsts:Found file in cache skip downloading..');
            return true;
        }
        logger.info('TemplateProcessor:checkFileExixsts:NO Found file in cache  downloading..');
        return false;
    }
}

module.exports = TemplateProcessor