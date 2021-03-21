// helpers for various tasks 

// Dependancies 
var crypto = require('crypto'); // requiring crypto node js library
var config = require('./config'); // requiring config file

// container for all the helpers
var helpers = {};

// create a SHA256 - hashing method built into node
helpers.hash = function(str){ // function takes in a string 
    if(typeof(str) == 'string' && str.length > 0){ // if the type of is a string and string length is greater than 0 then..
        var hash = crypto
        .createHmac('sha256', config.hashingSecret) // hash the string 'sha256' (type hashing), hashing secret from config object
        .update(str)
        .digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to am object in all cases, without throwing
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    } catch(e){
        return {};
    }
};





// Export the module
module.exports = helpers;

