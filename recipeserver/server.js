const fs = require('fs');
const http = require('http');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const recipesFilename = 'recipes.json';
const server = express();

server.use(cors());
server.use(bodyParser.json());

server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.get('/', async (req, res) => {
  res.writeHead(200, {'content-type': 'text/plain'});
  let file = '';
  try {
    file = await fs.promises.readFile(recipesFilename);
  } catch (error) {
    file = error;
  }
  res.end(`recipe:\n\n${file}`);
});

server.get('/recipes', async (req, res) => {
  async function createAndReadEmptyFile() {
    await fs.promises.writeFile(recipesFilename, JSON.stringify({recipes: []}));
    return await fs.promises.readFile(recipesFilename);
  }

  let fileContent;
  try {
    try {
      fileContent = await fs.promises.readFile(recipesFilename);
      try {
        JSON.parse(fileContent);
      } catch (error) {
        console.log('failed to JSON.parse recipes.json. Moving to recipes.json.broken.');
        await fs.promises.rename(recipesFilename, recipesFilename + '.broken');
        fileContent = await createAndReadEmptyFile();
      }
      console.log("get recipes fileContent: " + fileContent);
    } catch (err) {
      fileContent = await createAndReadEmptyFile();
    }
  } catch (err) {
    console.log('err: ' + err);
    res.writeHead(400, {'content-type': 'text/plain'});
    res.end(err.toString());
    return;
  }

  res.writeHead(200, {'content-type': 'application/json'});
  res.end(fileContent);
});

server.post('/recipes', async (req, res) => {
  try {
    await fs.promises.writeFile(recipesFilename, JSON.stringify(req.body, null, 2));
  } catch (err) {
    res.writeHead(400, {'content-type': 'text/plain'});
    res.end(err);
    return;
  }
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end(`successfully wrote to ${recipesFilename}`);
});

/*const port = process.env.PORT || 48880;
server.listen(port, () => console.log('http server listening on port ' + port));*/

const credentials = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
const httpsPort = process.env.PORT || 54321;
const httpsServer = https.createServer(credentials, server);
httpsServer.on('listening', () => console.log('httpsServer listening on port: ' + httpsPort));
httpsServer.listen(httpsPort);

/*const httpPort = httpsPort - 1;
const httpServer = http.createServer(server);
httpServer.on('listening', () => console.log('httpServer listening on port: ' + httpPort));
httpServer.listen(httpPort);*/
