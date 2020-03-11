
const request = require('superagent');
const fs = require('fs');

class DownloadManager {

    constructor(downloadParams) {
        this.downloadParams = downloadParams;
    }


    downloadFile(callback) {
        request
            .get(this.downloadParams.getSourceUrl())
            .on('error', function (error) {
                console.log(error);
            })
            .pipe(fs.createWriteStream(this.downloadParams.getDownloadPath()))
            .on('finish', function () {
                console.log('finished dowloading');
                callback(null)
            });
        }
}

module.exports = DownloadManager