const uuidv1 = require('uuid/v1'),
    request = require('request'),
    puppeteer = require('puppeteer'),
    azure = require('azure-storage'),
    path = require('path'),
    config = require('../envVariables'),
    constants = require('../helpers/constants'),
    DownloadParams = require('../helpers/DownloadParams'),
    TemplateProcessor = require('../helpers/TemplateProcessor');



class PrintService {
    constructor(config) {
        (async () => {
            try {
                this.config = config;
                this.pdfBasePath = '/tmp/'
                if (!this.detectDebug()) {
                    this.browser = await puppeteer.launch({
                        executablePath: 'google-chrome-unstable',
                        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox', '--no-margins']
                    });
                }
                else {
                    this.browser = await puppeteer.launch({
                        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
                    });
                }
                this.blobService = azure.createBlobService(this.config.azureAccountName, this.config.azureAccountKey);
            } catch (e) {
                console.error(e);
            }
        })();
    }

    generate(req, res) {
        (async () => {
            try {
                const url = req.query.fileUrl;
                if (!url)
                    this.sendClientError(res, { id: constants.apiIds.PRINT_API_ID });

                const page = await this.browser.newPage();
                var dowloadParams = new DownloadParams(url)
                var templateProcessor = new TemplateProcessor(dowloadParams)
                var dataPromise = templateProcessor.processTemplate()
                dataPromise.then(async result => {
                    console.log("the index html file path got:", result)
                    await page.goto(result)
                    const pdfFilePath = this.pdfBasePath + uuidv1() + '.pdf';
                    await page.pdf({
                        path: pdfFilePath, format: 'A4', printBackground: true
                    });
                    await this.browser.close()
                    const destPath = 'print-service/' + path.basename(pdfFilePath);
                    const pdfUrl = await this.uploadBlob(this.config.azureAccountName, this.config.azureContainerName, destPath, pdfFilePath);
                    this.sendSuccess(res, { id: constants.apiIds.PRINT_API_ID }, { pdfUrl: pdfUrl, ttl: 600 });
                }, function (err) {
                    console.log(err);
                    this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
                })

            } catch (error) {
                console.error("Error:", error);
                this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
            }
        })();
    }

    uploadBlob(accountName, container, destPath, pdfFilePath) {
        return new Promise((resolve, reject) => {
            this.blobService.createBlockBlobFromLocalFile(container, destPath, pdfFilePath, function (error, result, response) {
                if (!error) {
                    const pdfUrl = 'https://' + accountName + '.blob.core.windows.net/' + container + '/' + destPath;
                    resolve(pdfUrl);
                } else {
                    console.error('Error while uploading blob: ' + JSON.stringify(error));
                    reject(error);
                }
            });
        })
    }

    health(req, res) {
        this.sendSuccess(res, { id: constants.apiIds.HEALTH_API_ID });
    }

    sendServerError(res, options) {
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ts: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.SERVER_ERROR.name
        }
        res.status(constants.responseCodes.SERVER_ERROR.code);
        res.json(resObj);
    }

    sendClientError(res, options) {
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ts: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.CLIENT_ERROR.name
        }
        res.status(constants.responseCodes.CLIENT_ERROR.code);
        res.json(resObj);
    }

    sendSuccess(res, options, result = {}) {
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ts: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.SUCCESS.name,
            result: result
        }
        res.status(constants.responseCodes.SUCCESS.code);
        res.json(resObj);
    }

    detectDebug() {
        console.log("running mode", process.env.NODE_ENV);
        return (process.env.NODE_ENV !== 'production');
    }
}

module.exports = new PrintService(config);