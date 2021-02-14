const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];
const secrets = JSON.parse(fs.readFileSync('secrets.json'));
console.log('secrets: ' + JSON.stringify(secrets, null, 2));
const spotifyApi = new SpotifyWebApi(secrets);

const server = express();

server.use(bodyParser.json());

server.use('/frontend', express.static('frontend'));

server.get('/', (req, res) => {
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(`
  <!DOCTYPE html>
  <div>hello from /</div>
  <a target="_blank" href="/login">/login</a>
  `);
});

server.get('/login', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

server.get('/callback', async (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const access_token = data.body['access_token'];
    const refresh_token = data.body['refresh_token'];
    const expires_in = data.body['expires_in'];

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    console.log('access_token:', access_token);
    console.log('refresh_token:', refresh_token);

    console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.`);
    res.writeHead(307, {location: `/frontend?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`});
    res.end('hello from /callback');

    /*setInterval(async () => {
      const data = await spotifyApi.refreshAccessToken();
      const access_token = data.body['access_token'];

      console.log('The access token has been refreshed!');
      console.log('access_token:', access_token);
      spotifyApi.setAccessToken(access_token);
    }, expires_in / 2 * 1000);*/

  } catch (error) {
    console.error('Error getting Tokens:', error);
    res.send(`Error getting Tokens: ${error}`);
  }
});

const recipesFilename = 'recipes.json';

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

async function streamToString(str) {
  return new Promise((resolve, reject) => {
    let output = '';
    str.on('data', chunk => output += chunk);
    str.on('error', reject);
    str.on('end', resolve(output));
  });
}

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

const port = 48880;
server.listen(port, () => console.log('http server listening on port ' + port));
