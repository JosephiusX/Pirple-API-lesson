//  Request handlers

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');

// define handlers
var handlers = {};

// Users
handlers.users = function(data,callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){ // checking if request is post get put or delete
        handlers._users[data.method](data,callback); // directs to corisponding handler
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// users - post
// required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function(data, callback) {
    // check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; 
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        // make sure that the user dosent already exist
        _data.read('users',phone,function(err,data){
            if(err){
                // Hash the password
                var hashedPassword = helpers.hash(password);

                // create the user object
                if(hashedPassword){
                    var userObject = {
                        'firstName' : firstName,
                        'lastname' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
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
module.exports = handlers