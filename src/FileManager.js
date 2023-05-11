const fs = require('fs')
const logger = require('./sdk/log4js');



const getAbsolutePath = (path) => {
    var fullpath = __dirname +"/"+path;
    console.log("absolute path of download zip is:",fullpath )
    return fullpath;
}



const deleteFiles = (filePaths)=>{
filePaths.forEach(element => {
    fs.unlink(element, deleteFile)
});}


var deleteFile= function (err) {
    if (err) {
        logger.info("unlink failed", err);
    } else {
        logger.info("file deleted");
    }
}


exports.getAbsolutePath= getAbsolutePath;
exports.deleteFiles = deleteFiles;
