// library for storing and editing data

// Dependencies
var fs = require('fs'); // file system module
var path = require('path'); // module for normalizing the paths

// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.json(__dirname, '/../.data/');

// write data to a file
lib.create = function(dir,file,data,callback){
    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err, fileDescriptor) {
        if(!err && fileDescriptor){
        // convert data to string
        var stringData = JSON.stringify(data); //convert data to a string

        //write to a file and close it
        fs.writeFile(fileDescriptor,stringData,function(err){
            if(!err) {
                fs.close(fileDescriptor, function(err){
                    if(!err) {
                        callback(false);
                    } else {
                        callback('Error closing new file')
                    }
                });
            } else {
                callback('Error writing to new file');
            }
        });
        } else {
            callback('Could not create new file, it may already exist');
        }
    });
};







// Export the module
module.exports = lib;