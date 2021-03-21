// helpers for various tasks 

// Dependancies 
var crypto = require('crypto'); // requiring crypto node.js library
var config = require('./config'); // requiring config file

// container for all the helpers
var helpers = {};

// create a SHA256 - hashing method built into node
helpers.hash = function(str){ // function takes in a string, dosent accept a callback because it is going to return instead
    if(typeof(str) == 'string' && str.length > 0){ // if the typeof is a string and string length is greater than 0
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex'); // hash the string 'sha256' (type hashing), hashing secret from config object
        return hash; // return hash variable just created
    } else { 
        return false; 
    }
};

// Parse a JSON string to am object in all cases, without throwing
helpers.parseJsonToObject = function(str){ // function takes in a string 
    try{ // either 
        var obj = JSON.parse(str); // parses a string..
        return obj; // and returns it as a json object
    } catch(e){ // it the catch gets called..
        return {}; // return a empty object
    }
};





// Export the module
module.exports = helpers;

