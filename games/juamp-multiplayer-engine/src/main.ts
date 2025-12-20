import WebSocket from 'ws';
import * as http from 'node:http';

const redir_server = new http.Server((req, res) => {
    if (req.method !== 'GET') {
        res.writeHead(400, { "content-type": "text/plain" })
        res.end('Illegal request!');
        return;
    }

    res.writeHead(302, { "location": 'https://juamp.netlify.app' });
    res.end();
});
redir_server.listen(80);

const server = new WebSocket.Server({
    port: Number(process.env?.PORT) || 3000
});
server.on('conection', (req, res) => {});