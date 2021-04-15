const fs = require('fs');

const express = require('express');

const recipesFilename = 'recipes.json';
const server = express();

server.use(bodyParser.json());

server.use('/', (req, res) => {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.end(`hello world\n\nrecipe: TODO`);
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
  res.writeHead(200, {'content-type': 'application/json'});
  res.end();
});
