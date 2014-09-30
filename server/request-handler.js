/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */
var url = require('url');
var fs = require('fs');
var http = require('http');
var path = require('path');
var clientPath = '../client';
var chatLog = './chatlog.txt';
var controller  = require('./controller');
var results = [];
results.push({text: 'yolotrollo', username: 'sharkbait', createdAt: new Date(), roomname: 'lobby'});
results.push({text: '#burningman', username: 'kobra', createdAt: new Date(), roomname: 'lobby'});
results.push({text: 'date night with my hubby, tacobell! ;) #blessed', username: 'magee', createdAt: new Date(), roomname: 'lobby'});
var routes = {
  classes: {
    'GET': controller.get,
    'POST': controller.post,
    'OPTIONS': controller.options
  }
};


exports.handleRequest = function(request, response) {
  var parsedUrl = url.parse(request.url).pathname.split('/');
  var statusCode;

  if(url.parse(request.url).pathname === '/'){
    console.log("serving index.html")
    serveStaticFile(clientPath + '/index.html', request, response);
  } else if (parsedUrl[parsedUrl.length-1].split('.').length > 1) {
    console.log("serving other static file");
    console.log(parsedUrl.join('/'), 'path requested');
    serveStaticFile(clientPath + parsedUrl.join('/'), request, response);
  } else {
    var return404 = function(){
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end();
      return;
    };

    if (routes[parsedUrl[1]] === undefined){
      return return404();
    }

    var controllerMethod = routes[parsedUrl[1]][request.method];

    console.log('Serving request type ' + request.method + ' for url ' + request.url);

    var headers = defaultCorsHeaders;

    if (controllerMethod === undefined){
      return return404();
    }

    controllerMethod(request, response, parsedUrl, headers, results);
  }
};

var serveStaticFile = function(pathName, req, res){
  console.log(pathName);
  var splitPathname = pathName.split('/');
  var fileNameSplit = splitPathname[splitPathname.length-1].split('.');
  var extension = fileNameSplit[fileNameSplit.length - 1];
  var contentType = null;
  switch (extension){
    case 'html':
      contentType = 'text/html';
      break;
    case 'js':
      contentType = 'application/javascript';
      break;
    case 'css':
      contentType = 'text/css';
      break;
  }
  var absolutePathname = path.join(__dirname, pathName);
  fs.exists(absolutePathname, function(exists){
    if(!exists){
      absolutePathname = path.join(__dirname, '../client/404.html');
    }
    console.log()
    fs.readFile(absolutePathname, function(err, data){
      console.log(data)
      res.writeHead(200, {'Content-Type': contentType});
      res.write(data + '');
      res.end();
    });
  });
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
