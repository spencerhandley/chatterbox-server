/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var http = require('http');
var results = [];
results.push({text: 'yolotrollo', username: 'sharkbait', createdAt: new Date()});
results.push({text: '#burningman', username: 'kobra', createdAt: new Date()});
results.push({text: 'date night with my hubby, tacobell! ;) #blessed', username: 'magee', createdAt: new Date()});
var routes = {
  '/classes/messages': function(){

  },

  '/classes/room1': function(){

  },
  '/classes/chatterbox': function(){

  }
};

exports.handleRequest = function(request, response) {
  /* the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var statusCode;
  var data;
  var headers = defaultCorsHeaders;
  var parsedUrl = url.parse(request.url);
  // if
  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  if(request.method === 'GET'){
    if (routes[parsedUrl.pathname] !== undefined){
      statusCode = 200;
      data = JSON.stringify({results: results});
      response.writeHead(statusCode, headers);
      response.end(data);
    } else {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end();
    }
  } else if (request.method === 'POST'){
    statusCode = 201;
    request.on('data', function(chunk){
      results.push(JSON.parse(chunk.toString()));
      console.log(results)
      response.writeHead(statusCode, headers);
      response.end();
    });
  } else if (request.method === 'OPTIONS'){
    console.log('received OPTIONS request');
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end();
  }

};


/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
