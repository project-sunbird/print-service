const uuidv1 = require('uuid/v1'),
    request = require('request'),
    puppeteer = require('puppeteer'),
    azure = require('azure-storage'),
    path = require('path'),
    config = require('../envVariables'),
    constants = require('../helpers/constants')

class PrintService {
    constructor(config) {
        (async () => {
            try {
                this.config = config;
                this.pdfBasePath = '/tmp/'
                this.browser = await puppeteer.launch({
                    //   executablePath: 'google-chrome-unstable',
                    args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
                });
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
                console.log(constants.apiIds.PRINT_API_ID)
                if (!url)
                    this.sendClientError(res, { id: constants.apiIds.PRINT_API_ID  });
                const page = await this.browser.newPage();
                await page.goto(url);
                const pdfFilePath = this.pdfBasePath + uuidv1() + '.pdf'
                await page.pdf({ path: pdfFilePath, format: 'A4' });
                page.close()
                const destPath = 'print-service/' + path.basename(pdfFilePath);
                const pdfUrl = await this.uploadBlob(this.config.azureAccountName, this.config.azureContainerName, destPath, pdfFilePath);
                this.sendSuccess(res, { id: constants.apiIds.PRINT_API_ID }, { pdfUrl: pdfUrl });
            } catch (error) {
                console.error('Error: '+ JSON.stringify(error));
                this.sendError(res, { id: constants.apiIds.PRINT_API_ID  });
            } finally {
                console.log('Executing finally block');
            }
        })();
    }

    uploadBlob(accountName, container, destPath, pdfFilePath) {
        return new Promise((resolve, reject) => {
            this.blobService.createBlockBlobFromLocalFile(container, destPath, pdfFilePath, function(error, result, response){
                if(!error) {
                    const pdfUrl = 'https://' + accountName + '.blob.core.windows.net/' + container + '/' + destPath;
                    resolve(pdfUrl);
                } else {
                    console.error('Error while uploading blob: '+ JSON.stringify(error));
                    reject(error);
                }
            });
        })
    }

    health(req, res) {
        this.sendSuccess(res, { id: constants.apiIds.HEALTH_API_ID });
    }

    sendError(res, options) {
        console.log(options.id)
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ets: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.SERVER_ERROR.name
        }
        res.status(constants.responseCodes.SERVER_ERROR.code);
        res.json(resObj);
    }

    sendClientError(res, options) {
        console.log(options.id)
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ets: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.CLIENT_ERROR.name
        }
        res.status(constants.responseCodes.CLIENT_ERROR.code);
        res.json(resObj);
    }

    sendSuccess(res, options, result = {}) {
        console.log(options.id)
        const resObj = {
            id: options.id,
            ver: options.ver || constants.apiIds.version,
            ets: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || constants.responseCodes.SUCCESS.name,
            result: result
        }
        res.status(constants.responseCodes.SUCCESS.code);
        res.json(resObj);
    }

}

module.exports = new PrintService(config);