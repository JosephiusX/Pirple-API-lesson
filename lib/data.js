// library for storing and editing data

// Dependencies
var fs = require('fs'); // file system module
var path = require('path'); // module for normalizing the paths
const helpers = require('./helpers'); // require helpers file

// Container for the module (to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// write data to a file
lib.create = function(dir,file,data,callback){
    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err, fileDescriptor) {
        if(!err && fileDescriptor){
        // convert data to string
        var stringData = JSON.stringify(data);

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

// Read data from a file
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        if(!err && data){ // if no err and there is data
           var parsedData = helpers.parseJsonToObject(data); // parse data to json  
           callback(false,parsedData);
        } else {
            callback(err,data);
        }
    });
};

// Update data inside a file
lib.update = function(dir,file,data,callback){
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // convert data to string
            var stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fileDescriptor, function(err){
                if(!err){
                    // write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                       if(!err){
                        fs.close(fileDescriptor, function(err){
                            if(!err) {
                                callback(false);
                            } else {
                                callback('error closing the existing file')
                            }
                        });
                       } else {
                           callback("error writing to existing file");
                       }
                    });
                } else {
                    callback('error truncating file');
                }
            });
        } else{
            callback('could not open the file for updating, it may not exist yet');
        }

    });
};

// Delete a file
lib.delete = function(dir,file,callback){
    // Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};





// Export the module
module.exports = lib;