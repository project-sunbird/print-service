const logger = require('../sdk/log4js');
const uuidv1 = require('uuid/v1'),
    request = require('request'),
    puppeteer = require('puppeteer'),
    azure = require('azure-storage'),
    path = require('path'),
    config = require('../envVariables'),
    constants = require('../helpers/constants'),
    DownloadParams = require('../helpers/DownloadParams'),
    TemplateProcessor = require('../helpers/TemplateProcessor'),
    Request = require('../helpers/Request'),
    HtmlGenerator = require('../generators/HtmlGenerator'),
    filemanager = require('../FileManager'),
    serviceName = 'print-service/',
    StorageParams = require('../helpers/StorageParams'),
    util = require('util');


class PrintService {
    constructor(config) {
        (async () => {
            try {
                this.config = config;
                this.pdfBasePath = '/tmp/'
                var args = constants.argsConfig.DEBUG_MODE
                if (!this.detectDebug()) {
                    args = constants.argsConfig.PROD_MODE
                }
                logger.info("PrintService:the puppeter args got", args)
                this.browser = await puppeteer.launch(args);
                this.browser.on('disconnected', async () => {
                   this.browser = await puppeteer.launch(args)
                });
                this.blobService = azure.createBlobService(this.config.azureAccountName, this.config.azureAccountKey);
                this.pvtBlobService = azure.createBlobService(this.config.privateContainer.azureAccountName, this.config.privateContainer.azureAccountKey);
            } catch (e) {
                logger.error("error while launching puppeteer", e)
            }
        })();
    }

    printPdf(req, res) {
        (async () => {
            try {
                this.validateRequest(res, req.body.request)
                var request = this.getComposedRequest(req.body.request);
                var dowloadParams = new DownloadParams(request.getHtmlTemplate())
                var templateProcessor = new TemplateProcessor(dowloadParams)
                var dataPromise = templateProcessor.processTemplate()
                dataPromise.then(async htmlFilePath => {
		    try {
			logger.info("PrintService:printPdg:the index html file got:", htmlFilePath)
			var htmlGenerator = new HtmlGenerator(htmlFilePath, request);
			var mappedHtmlFilePath = htmlGenerator.generateTempHtmlFile()
			const page = await this.browser.newPage();
			await page.goto("file://" + mappedHtmlFilePath, { waitUntil: 'networkidle0' })
			const pdfFilePath = filemanager.getAbsolutePath(dowloadParams.getFileExtractToPath()) + request.getRequestId() + '.pdf';
			await page.pdf({
			    path: pdfFilePath, format: 'A4', printBackground: true
			});
			page.close()
			const destPath = request.getStorageParams().getPath() + path.basename(pdfFilePath);
			const pdfUrl = await this.uploadBlob(this.pvtBlobService, this.config.privateContainer.azureAccountName, request.getStorageParams().getContainerName(), destPath, pdfFilePath);
			this.sendSuccess(res, { id: constants.apiIds.PRINT_API_ID }, { pdfUrl: pdfUrl, ttl: 600 });
			this.sweepFiles([mappedHtmlFilePath, pdfFilePath])
		    } catch (err) {
			logger.error("PrintService:error after dataPromise got:", err); 
			this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
		    }
		}).catch(function (err) {
		    logger.error("PrintService:error in dataPromise got:", err); 
		    this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
		})
            } catch (error) {
                logger.error("PrintService:Errors:", error);
                this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
            }
        })();
    }

    getComposedRequest(reqMap) {
        var requestId = uuidv1();
        var contextMap = reqMap.context || {};
        var htmlTemplate = reqMap.htmlTemplate;
        var storageParams = this.getStorageDetails(reqMap);
        var request = new Request(contextMap, htmlTemplate, requestId,storageParams);
        return request;
    }


    getStorageDetails(reqMap){
    var storage = new StorageParams();
    if(reqMap.storageParams!=null){    
    storage.setPath(reqMap.storageParams.path ||  serviceName);
    storage.setContainerName(reqMap.storageParams.containerName || this.config.privateContainer.azureContainerName);
    logger.info("Print-service:getStorageDetails:storage params found in req got:", storage)
    return storage;
    }
    storage.setContainerName(this.config.privateContainer.azureContainerName)
    storage.setPath(serviceName)
    logger.info("Print-service:getStorageDetails:storage params not found in req:", storage)
    return storage;
    }

    validateRequest(res, request) {
        if (!request) {
            logger.error("invalid provided request", request)
            this.sendClientError(res, { id: constants.apiIds.PRINT_API_ID,params:this.getErrorParamsMap("request")});
        }
        if(!request.htmlTemplate){
            logger.error("invalid provided request htmltemplate is missing", request)
            this.sendClientError(res, { id: constants.apiIds.PRINT_API_ID,params: this.getErrorParamsMap("request.htmlTemplate")});
        }
    }

    getErrorParamsMap(missingField){
        var map = {
            "errmsg": util.format("Mandatory params %s is required.",missingField)
        };
        return map;
    }

    sweepFiles(filePathsArray) {
        filemanager.deleteFiles(filePathsArray)

    }
  
  
    generate(req, res) {
        (async () => {
            try {
                const url = req.query.fileUrl;
                if (!url)
                    this.sendClientError(res, { id: constants.apiIds.PRINT_API_ID });
                const page = await this.browser.newPage();
                await page.goto(url);
                const pdfFilePath = this.pdfBasePath + uuidv1() + '.pdf'
                await page.pdf({ path: pdfFilePath, format: 'A4', printBackground: true });
                page.close();
                const destPath = serviceName + path.basename(pdfFilePath);
                const pdfUrl = await this.uploadBlob(this.blobService, this.config.azureAccountName, this.config.azureContainerName, destPath, pdfFilePath);
                this.sendSuccess(res, { id: constants.apiIds.PRINT_API_ID }, { pdfUrl: pdfUrl, ttl: 600 });
            } catch (error) {
                console.error('Error: ', error);
                this.sendServerError(res, { id: constants.apiIds.PRINT_API_ID });
            }
        })();
    }

    uploadBlob(blobService, accountName, container, destPath, pdfFilePath) {
        return new Promise((resolve, reject) => {
            blobService.createBlockBlobFromLocalFile(container, destPath, pdfFilePath, function (error, result, response) {
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
        var resObj = {
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
        logger.info("app running mode", process.env.NODE_ENV);
        return (process.env.NODE_ENV !== 'production');
    }
}

module.exports = new PrintService(config);
