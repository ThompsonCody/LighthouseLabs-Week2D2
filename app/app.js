// FIRST SERVER EXAMPLE

const http = require('http'),
      PORT = 8080;

function requestHandler(request, response){
  //Reads values from the request and sends a string back to the client using the response object
  if(request.url == "/"){
    response.end("Welcome!");
  } else if (request.url == "/urls") {
    response.end("www.lighthouselabs.ca\nwww.google.com");
  } else {
    response.statusCode = 404;
    response.end("unknown path");
  }
  //response.end(`Requested Path: ${request.url}\nRequest method: ${request.method} `);
} //Callback function invoked by the HTTP module function

var server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});