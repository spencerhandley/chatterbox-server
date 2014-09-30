var fs = require('fs');
var path = require('path');
var chatLog = './chatlog.txt';

exports.get = function(request, response, parsedUrl, headers){
  console.log('Get req receved');

  var statusCode = 200;
  fs.readFile(chatLog, function(err, data){
    if (err) throw err;
    var dataString = data.toString();
    var results = JSON.parse('[' + dataString.substring(0, dataString.length - 1) + ']');
    // results = results.map(function(item){
    //   return JSON.parse(item);
    // });
    console.log(results);
    var data = JSON.stringify({results: results.reverse()});
    console.log(data, 'data');
    response.writeHead(statusCode, headers);
    response.end(data);
  });
};

exports.post = function(request, response, parsedUrl, headers){
  var statusCode = 201;
  request.on('data', function(chunk){
    fs.appendFile(chatLog, chunk.toString() + ',', function(err){
      if (err) throw err;
      console.log('added new msg', chunk.toString());
    });
    // results.unshift(JSON.parse(chunk.toString()));
    response.writeHead(statusCode, headers);
    response.end();
  });
};

exports.options = function(request, response, parsedUrl, headers){
  console.log('options req receved');
  var statusCode = 200;
  response.writeHead(statusCode, headers);
  response.end();
};
