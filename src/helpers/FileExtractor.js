const logger = require('../sdk/log4js');
const admZip = require('adm-zip');
const filemanager = require('../FileManager')


/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */

 
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
        logger.info('FileExtractor:extractZipFile:start unzip at path', this.downloadParams.getFileExtractToPath());
        zip.extractAllTo(this.downloadParams.getFileExtractToPath(), true);
        logger.debug('FileExtractor:extractZipFile:finished unzip in secs:', Date.now() - startTime);
        callback(null,filemanager.getAbsolutePath(this.downloadParams.getHtmlPath()))
    }
}

module.exports = FileExtactor;