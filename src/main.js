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
      Authorization: `Bearer ${code}`,
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

  log('code: ' + code);
  log('going to fetch /me...');
  const result = fetchWebApi('me', 'GET');
  window.result = result;
  log('window.result set');
})();
