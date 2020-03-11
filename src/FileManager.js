

const getAbsolutePath = (path) => {
    var fullpath = __dirname +"/"+path;
    console.log("absolute path of download zip is:",fullpath )
    return fullpath;
}

exports.getAbsolutePath= getAbsolutePath;
