import http from 'http';

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!');
});

server.listen(8000, () => {
  // eslint-disable-next-line no-console
  console.log('Server running at http://localhost:8000');
});
