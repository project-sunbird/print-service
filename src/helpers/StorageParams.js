class StorageParams{

constructor(){
    
}


setPath(path){
    this.path = path;
}

setContainerName(containerName){
    this.containerName= containerName;
}

getPath(){
    return this.path;
}

getContainerName(){
    return this.containerName;
}

}

module.exports=StorageParams;