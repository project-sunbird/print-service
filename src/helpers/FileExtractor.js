
const admZip = require('adm-zip');
const filemanager = require('../FileManager')

class FileExtactor {

    constructor(downloadParams) {
        this.downloadParams = downloadParams
    }
/**
 * this method will extract the zip file and return the absolute path file uri.
 * @param {*} callback 
 */
    extractZipFile(callback) {
        const startTime = Date.now();
        var zip = new admZip(this.downloadParams.getDownloadPath());
        console.log('start unzip at path', this.downloadParams.getFileExtractToPath());
        zip.extractAllTo(this.downloadParams.getFileExtractToPath(), true);
        console.log('finished unzip in secs:', Date.now() - startTime);
        callback(null,filemanager.getAbsolutePath(this.downloadParams.getHtmlPath()))
    } 


    

}

module.exports = FileExtactor;