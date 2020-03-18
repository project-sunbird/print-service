const logger = require('../sdk/log4js');
const request = require('superagent');
const fs = require('fs');


/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */
class DownloadManager {

    constructor(downloadParams) {
        this.downloadParams = downloadParams;
    }


    downloadFile(callback) {
        request
            .get(this.downloadParams.getSourceUrl())
            .on('error', function (error) {
                logger.error("DownloadManager:downloadFile:",error);
            })
            .pipe(fs.createWriteStream(this.downloadParams.getDownloadPath()))
            .on('finish', function () {
                logger.info('finished dowloading');
                callback(null)
            });
        }
}

module.exports = DownloadManager