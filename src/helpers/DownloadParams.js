const logger = require('../sdk/log4js');

/**
 * @author Anmol Gupta <anmol@ilimi.in>
 */

class DownloadParams {


    constructor(sourceUrl) {
        this.sourceUrl = sourceUrl;
        this.CERT_DOWNLOAD_FOLDER= "certs/"
    }

    getDownloadPath() {
        const fileName = this.getFileName()
        const downloadPath = this.CERT_DOWNLOAD_FOLDER.concat(fileName)
        logger.info("DownloadParams:getDownloadPath:Download path formed:", downloadPath)
        return downloadPath;
    }


    getSourceUrl() {
        return this.sourceUrl;
    }

    getFileExtractToPath() {
        const extactToPath = this.CERT_DOWNLOAD_FOLDER.concat(this.getFileName().replace(".zip", "/"))
        logger.info("DownloadParams:getFileExtractToPath got:", extactToPath)
        return extactToPath
    }


    getHtmlPath() {
        const htmlPath = this.CERT_DOWNLOAD_FOLDER.concat(this.getFileName().replace(".zip", "/index.html"))
        logger.info("DownloadParams:getHtmlPath:index.html file path is:", htmlPath)
        return htmlPath;


    }

    getFileName() {
        return this.sourceUrl.substring(this.sourceUrl.lastIndexOf('/') + 1);
    }

}

module.exports = DownloadParams;