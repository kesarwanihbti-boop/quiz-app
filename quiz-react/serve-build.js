const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "build");
const port = 3001;

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(root, requestPath);
  const safePath = filePath.startsWith(root) ? filePath : path.join(root, "index.html");

  fs.readFile(safePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, "index.html"), (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(indexData);
      });
      return;
    }

    res.writeHead(200, { "Content-Type": types[path.extname(safePath)] || "text/plain" });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`React build running at http://localhost:${port}`);
});
