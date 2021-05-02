const fs = require('fs');
const http = require('http');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mkdirp = require('mkdirp');

const recipesFilename = 'recipes.json';
const server = express();

server.use(cors());
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

// Don't do that - copperwall 2021-05-02 6:23pm
/*server.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});*/

server.get('/', async (req, res) => {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end(`spookify user recipes server`);
});

async function readOrCreateEmptyJsonFile(filepath) {
  try {
    const filecontent = await fs.promises.readFile(filepath);
    try {
      return JSON.parse(filecontent);
    } catch (error) {
      // TODO is this error message a security problem?
      throw new Error(`failed to parse json from filepath: ${filepath}\n\nerror:\n${error}\n\nfilecontent:\n${filecontent}`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // the file doesn't exist, so create a new one.
      try {
        mkdirp(path.dirname(filepath));
        await fs.promises.writeFile(filepath, '{}');
      } catch (error) {
        throw new Error
      }
    } else {
      throw error;
    }
  }
}

async function createAccount(username, password) {
}

async function authenticate(username, password) {
}

// /recipes?username=username&password=password
//   json body
server.get('/recipes', async (req, res) => {
  //console.log('/recipes  req.query: ' + JSON.stringify(req.query, null, 2));
  const {username, password} = req.query;
  if (!username || !password) {
    res.writeHead(400, {'content-type': 'text/plain'});
    res.write('bad request. both username and password are required in query params. given:\n');
    res.write(`username: ${username}\n`);
    res.write(`password: ${password}\n`);
    res.end();
    return;
  }

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

server.use((req, res) => {
  res.writeHead(404, {'content-type': 'text/plain'});
  res.end(`404 not found:\n${req.method} ${req.url}`);
});

const credentials = {
  key: fs.readFileSync('secrets/key.pem'),
  cert: fs.readFileSync('secrets/cert.pem')
};
const httpsPort = 8443;
const httpsServer = https.createServer(credentials, server);
httpsServer.on('listening', () => console.log('httpsServer listening on port: ' + httpsPort));
httpsServer.listen(httpsPort);

const httpPort = 8080;
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, {
    'content-type': 'text/plain',
    'location': `https://${req.headers.host}${req.url}`
  });
  res.end('redirecting from http to https');
});
httpServer.on('listening', () => console.log('httpServer listening on port: ' + httpPort));
httpServer.listen(httpPort);
