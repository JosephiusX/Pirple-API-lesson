// Primary file for API

// Dependancies
var http = require('http'); // requiring http lib
var https = require('https');
var url = require('url'); // node library for url functions
var StringDecoder = require('string_decoder').StringDecoder; // node library 
var config = require('./lib/config'); // requiring the config.js file,  node knows this means config.js
var fs = require('fs'); // importing node file system library
// var _data = require('./lib/data'); // requiring data.js from the lib directory
var handlers = require('./lib/handlers'); // requiring handlers.js from lib dir
var helpers = require('./lib/helpers'); // requiring helpers file from lib folder

// TESTING
// @TODO delete  

// // creating file
// _data.create('test','newFile',{'foo' : 'bar'},function(err){
//     console.log('this was the error' ,err);
// });

// // read file
// _data.read('test','newFile',function(err,data){  // similar to create only with read instead and no need to pass in data
//     console.log('this was the error' ,err, 'and this was the data',data);
// });

// update file
// _data.update('test','newFile', {'fizz':'buzz'}, function(err,data){  
//     console.log('this was the error' ,err);
// });

// // delete  file
// _data.delete('test','newFile', function(err){  
//     console.log('this was the error' ,err);
// });



// Instantiate the http server
var httpServer = http.createServer(function(req,res){ // creating a server named server
    unifiedServer(req, res)
});

// start the http server
httpServer.listen(config.httpPort, function(){ // telling server to listen on port 3000
    console.log("the HTTP server is listening on port "+config.httpPort);  // lets us know that it is listening
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res){ // creating a server named httpsServer
    unifiedServerco(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){ // telling server to listen on port 3000
    console.log("the HTTPS server is listening on port "+config.httpsPort);  // lets us know that it is listening
});

// all the server logic for both the http and https server
var unifiedServer = function(req, res) {
    
    // get the url and parse it 
    var parsedUrl = url.parse(req.url,true); // check stack overflow to see why this is deprecated
    
    
    // get the path
    var path = parsedUrl.pathname; // untrimmed path the user requested
    var trimmedPath = path.replace(/^\/+|\/+$/g,''); // regEx for trimmig slashes of the front and end of the path 
    
    //Get the query string as an object
    var queryStringObject = parsedUrl.query;
    
    // Get the HTTP Method
    var method = req.method.toLowerCase();
    
    // Get the http method
    var headers = req.headers;
    
    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = ''; // string for the incoming stream of data
    req.on('data',function(data){ // as request payload gets streamed in the request object is going to emmit a data event that we are binding on
        buffer += decoder.write(data); // we use a decoder to to turn the data to a simple string through utf 8
    });
    req.on('end', function(){ // when it ends
        buffer += decoder.end(); // we cap off the buffer with whatever the request ended with
        
        // choose the request the handler should go to. If one is not found, use the not found handler
        var chooseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
        // construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer) // making payload parsed json data instead of raw
        };
        
        //route the request to the handler spacified in the router
        chooseHandler(data,function(statusCode, payload) {
            
            // use the status code called back by the  handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};
            
            // convert the payload to a string
            var payloadString = JSON.stringify(payload);
            
            // Return the response
            res.setHeader('Content-type', 'application/json'); // telling the destination that this is json so it can be properly parced on the other end
            res.writeHead(statusCode); // using built in writeHead function that comes on every response object recieved by the http server to write a status code
            res.end(payloadString); // send the response
            
            // log the request path
            console.log('Returning this response: ', statusCode, payloadString); // log out what the payload was 
        });
        
    });
}



// Define a request router
var router = {
    'ping' : handlers.ping,
    'users' : handlers.users // matching path users to handlers.users
};

// 49:36

