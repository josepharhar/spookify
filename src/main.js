// TODO delet this and package.json
import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';

const code = new URLSearchParams(window.location.search).get('code');

function dialogError(str) {
  const dialog = document.createElement('dialog');
  dialog.textContent = str;
  document.body.appendChild(dialog);
  dialog.showModal();
}

async function fetchWebApi(endpoint, method, body) {
  const params = {
    headers: {
      Authorization: `Bearer ${window.localStorage.accessToken}`,
    },
    method: method
  };
  if (body) {
    params.body = JSON.stringify(body);
  }

  const res = await fetch(`https://api.spotify.com/${endpoint}`, params);
  return await res.json();
}

function log(str) {
  console.log(str);
  const div = document.createElement('div');
  div.textContent = str;
  document.getElementById('output').appendChild(div);
}

(async () => {
  if (!code) {
    dialogError('code query parameter is missing');
    return;
  }

  const codeVerifier = window.localStorage.codeVerifier;
  if (!codeVerifier) {
    dialogError('codeVerifier is missing from localStorage');
    return;
  }

  log('code: ' + code);
  log('going to get authorization code...');

  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: window.localStorage.clientid,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  };
  // TODO add error handling and logging here...?
  const body = await fetch(url, payload);
  const response = await body.json();
  const accessToken = response.access_token;
  window.localStorage.accessToken = accessToken;

  log('access_token: ' + accessToken);

  log('going to fetch /me...');
  const result = fetchWebApi('me', 'GET');
  window.result = result;
  log('window.result set');
})();
