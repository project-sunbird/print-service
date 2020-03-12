const fs = require('fs')


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
        console.log("unlink failed", err);
    } else {
        console.log("file deleted");
    }
}


exports.getAbsolutePath= getAbsolutePath;
exports.deleteFiles = deleteFiles;
