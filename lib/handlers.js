//  Request handlers

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// define handlers
var handlers = {};

// figure out which method im requesting
// figure out if it is a acceptable method
// and pass it along to some sub handlers
        // Users
handlers.users = function(data,callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete']; // adding accetable methods to this array
    if(acceptableMethods.indexOf(data.method) > -1){ // checking if the data method is one of the ones in the array
        handlers._users[data.method](data,callback); // directs to corisponding handler
    } else { // if the method dosent exist then
        callback(405); // callback 405
    }
};

// Container for the users submethods
handlers._users = {}; // object with the acceptable methods

// users - post
// required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) { // setting post in handlers.users to a function that accepts a callback and a data
    // check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; // if var firstname is a string trimed and it has a length greater than 0 then return it else it is false
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false; // same but for last name
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false; // if number is a string trimmed and its length is = to 10 then return the payload trimmed else return false
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false; // must be string and trimmed length must be more than 0 then return trimmed password payload else return false
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false; // terms of service is a boolean and it is true then return true else return false

    if(firstName && lastName && phone && password && tosAgreement){ // if all thease checks above return true then..
        
        _data.read('users',phone,function(err,data){// returns error if phfone number already exists
            if(err){ // if so
                
                var hashedPassword = helpers.hash(password); // Hash the password first so as to not store it in plain text , hash() from node crypto lib

                // create the user object
                if(hashedPassword){ 
                    var userObject = {
                        'firstName' : firstName,
                        'lastname' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : truei
                    };
    
                    // store the user
                    _data.create('users',phone,userObject,function(err){
                        if (!err){
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500, {'Error' : 'Could not create the new user'});
                        }
                    });
                }else {
                    callback(500, {'Error' : 'Could not create the new user\'s password'});
                }

            } else {
                // user already exists
                callback(400,{'Error' : 'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// users - get
// require data phone
// optional data: none
// @TODO only let an authenticated user access their object. Dont let them access anyone elses


handlers._users.get = function(data, callback) {
    // check that the phone number provided is valad
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Lookup the user
        _data.read('users',phone, function(err,data){
            if(!err && data){
                // remove the hashed password from the user object before returning it to the requestor
                delete data.hashedPassword;
                callback(200,data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// users - put
handlers._users.put = function(data, callback) {

};

// users - delete
handlers._users.delete = function(data, callback) {

};


// Not found handler
handlers.notFound = function(data,callback) {
    callback(404);
};

// Export the module
module.exports = handlers // exporting object handlers