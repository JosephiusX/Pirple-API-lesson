//  Request handlers

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');  // refrencing lib within this dir thus ./

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
                // Hash the password the user inputs so as to not store it in plain text 
                var hashedPassword = helpers.hash(password);  // , hash in the helpers file

                // create the user object
                if(hashedPassword){ // only created the userObject it the password was hashed
                    var userObject = { // creates the user object
                        'firstName' : firstName,
                        'lastname' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword, // use hashedPassword for user object instead of password
                        'tosAgreement' : true
                    };
    
                    // store the user
                    _data.create('users',phone,userObject,function(err){ // using the create function from data.js file and passing in dir,file,data,callback
                        if (!err){ // if no err 
                            callback(200) // callback 200 (success status)
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
handlers._users.get = function(data, callback) {
    // check that the phone number provided is valad
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false; // the phone number is a string and its length = 10 or phone number trimmed is defaulted to false
    if(phone){ // if number was provided and valid

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valad for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
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
                callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// users - put
// Required data : phone
// Optional data: firstName, password (at least one must be specified)
// @TODO  only let an authenticated user update their own objet. Don't let them update anyone else's
handlers._users.put = function(data, callback) {
// check for the required field
var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false; // the phone number is a string and its length = 10 or phone number trimmed is defaulted to false

// Check for the optional fields
var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; // if var firstname is a string trimed and it has a length greater than 0 then return it else it is false
var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false; // same but for last name // if number is a string trimmed and its length is = to 10 then return the payload trimmed else return false
var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false; // must be string and trimmed length must be more than 0 then return trimmed password payload else return false

// Error if the phode is invalid
if(phone){
    //Error if nothing is snt to update
    if(firstName || lastName || password){

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valad for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                
        // lookup the user
        _data.read('users',phone,function(err,userData){
            if(!err && userData){ // if theres no err and there is userData
                // Update the fields necessary
                if(firstName){// if first name has been set
                    userData.firstName = firstName; // update userData firstname with whatever this new value os 
                } 
                if(lastName){ // same but with lastName
                    userData.lastName = lastName;
                }
                if(password) {
                    userData.hashedPassword = helpers.hash(password);
                }
                // Store the new updates
                _data.update('users',phone,userData,function(err){
                    if(!err){ // if not an err
                        callback(200);
                    } else {
                        console.log(err);
                        callback(500, {'Error' : 'Could not update the user'});
                    }
                });
            } else {
                callback(400, {'Error' : 'The specified user does not exist'});
            }
        });
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
            }
        });

    } else {
        callback(400, {'Error' : 'Missing fields to update'});
    }
}
};

// users - delete
// Required field : phone
handlers._users.delete = function(data, callback) {
    // check that the phone number provided is valad
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false; // the phone number is a string and its length = 10 or phone number trimmed is defaulted to false
    if(phone){ // if number was provided and valid

        // Get the token from the headers
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valad for the phone number
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
            // Lookup the user
            _data.read('users',phone, function(err,data){
            if(!err && data){
                _data.delete('users',phone,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500,{'Error' : 'Could not delete the specified user'});
                    }
                });
            } else {
                callback(400, {'Error' : 'Could not find the specified user'});
            }
        });
            } else {
                callback(403, {'Error' : 'Missing required token in header, or token is invalid'});
            }
        });
      
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

        // Tokens
        handlers.tokens = function(data,callback){
            var acceptableMethods = ['post', 'get', 'put', 'delete']; // adding accetable methods to this array
            if(acceptableMethods.indexOf(data.method) > -1){ // checking if the data method is one of the ones in the array
                handlers._tokens[data.method](data,callback); // directs to corisponding handler
            } else { // if the method dosent exist then
                callback(405); // callback 405
            }
        };

        // Container for all the tokens methods
        handlers._tokens = {};

        // Tokens - post
        // Required data: phone, password
        // Optional data: none
        handlers._tokens.post = function(data,callback){
            var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false; // if number is a string trimmed and its length is = to 10 then return the payload trimmed else return false
            var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false; // must be string and trimmed length must be more than 0 then return trimmed password payload else return false
            if(phone && password){
                // Lookup the user who matches that phone number
                _data.read('users',phone,function(err,userData){
                    if(!err && userData){
                        // hash the send password, and compare it to the password stored in the user object
                        var hashedPassword = helpers.hash(password);
                        if(hashedPassword == userData.hashedPassword){
                            // If valad create a new token with a random name. Set expiration date 1 hour in the future
                            var tokenId = helpers.createRandomString(20);
                            var expires = Date.now() + 1000 * 60 * 60;
                            var tokenObject = {
                                'phone' : phone,
                                'id' : tokenId,
                                'expires' : expires
                            };

                            // Store the token
                            _data.create('tokens', tokenId,tokenObject,function(err){
                                if(!err){
                                    callback(200,tokenObject);
                                } else {
                                    callback(400, {'Error' : 'Could not create the new token'});
                                }
                            })
                        } else {
                            callback(400,{'Error' : 'Could not find the specified user\'s stored password'});
                        }
                    } else {
                        callback(400,{'Error': 'Could not find the specific user'});
                    }
                });
            } else {
                callback(400, {'Error' : 'Missing required fields'});
            }
        };

        // Tokens - get
        // require data : id
        // Optional data: none
        handlers._tokens.get = function(data,callback){
            // Check that id is valid
            var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
            if(id){
              // Lookup the token
              _data.read('tokens',id,function(err,tokenData){
                if(!err && tokenData){
                  callback(200,tokenData);
                } else {
                  callback(404);
                }
              });
            } else {
              callback(400,{'Error' : 'Missing required field, or field invalid'})
            }
          };

        // Tokens - put
        // Required data : id, extend
        // Optional data : none
        handlers._tokens.put = function(data,callback){
            // Check that the phone number is valid    
            var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false; // the id number is a string and its length = 10 or id number trimmed is defaulted to false
            var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
            if(id && extend) { // if theres an id and extend = true
                // Lookup the token
                _data.read('tokens',id,function(err,tokenData){
                    if(!err && tokenData){
                        // Check to make sure the token isin't already expired
                        if(tokenData.expires > Date.now()){
                            // Set the expiration an hour from now
                            tokenData.expires = Date.now() + 1000 * 60 * 60;

                            // Store the new updates
                            _data.update('tokens', id,tokenData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    callback(500, {'Error':'could not update the tokens expiration'});
                                }
                            });
                        } else {
                            callback(400, {'Error' : 'The token has already expired, and cannot be extemded'});
                        }
                    } else {
                        callback(400, {'Error' : 'Specified token does not exist'});
                    }
                });
            } else {
                callback(400,{'Error' : 'Missing returned fields(s) or field(s) are invalid '});
            }
        };

        // Tokens - delete
        // required data: id
        // Optional data: none
        handlers._tokens.delete = function(data,callback){
            // check that the id is valad
            var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false; // the id number is a string and its length = 20 or phone number trimmed is defaulted to false
            if(id){ // if id was provided and valid
                // Lookup the user
                _data.read('tokens',id,function(err,data){
                    if(!err && data){
                        _data.delete('tokens',id,function(err){
                            if(!err){
                                callback(200);
                            } else {
                                callback(500,{'Error' : 'Could not delete the specified token'});
                            }
                        });
                    } else {
                        callback(400, {'Error' : 'Could not find the specified token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Missing required field'});
            }
        };

        // Verify if a given token id is currently valid for a given user
        handlers._tokens.verifyToken = function(id,phone,callback){
            // Lookup the token
            _data.read('tokens',id,function(err,tokenData){
                if(!err && tokenData){
                    // check that the token is for the given user and has not expired
                    if(tokenData.phone == phone && tokenData.expires > Date.now()){
                        callback(true);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            });
        };

        


// Not found handler
handlers.notFound = function(data,callback) {
    callback(404);
};

// ping handler
handlers.ping = function(data,callback){
    callback(200);
}

// Export the module
module.exports = handlers // exporting object handlers