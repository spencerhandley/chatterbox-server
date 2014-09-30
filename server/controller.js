exports.get = function(request, response, parsedUrl, headers, results){
  console.log('Get req receved');

  var statusCode = 200;
  var data = JSON.stringify({results: results});
  response.writeHead(statusCode, headers);
  response.end(data);
};

exports.post = function(request, response, parsedUrl, headers, results){
  var statusCode = 201;
  request.on('data', function(chunk){
    results.push(JSON.parse(chunk.toString()));
    response.writeHead(statusCode, headers);
    response.end();
  });
};

exports.options = function(request, response, parsedUrl, headers, results){
  console.log('options req receved');
  var statusCode = 200;
  response.writeHead(statusCode, headers);
  response.end();
};
