const http = require('http'),
    server = http.createServer((request,response)=>{
        response.writeHead(200,{'Content-Type':'text/plain'});
        response.write('Hello world');
        response.end();
    });
server.listen(3000,()=>{
    console.log('Node server created at port 3000');
});