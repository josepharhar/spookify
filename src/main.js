// TODO delet this and package.json
import { SpotifyApi } from '/node_modules/@spotify/web-api-ts-sdk/dist/mjs/index.js';

const code = new URLSearchParams(window.location.search).get('code');

function dialogError(html) {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = html;
  document.body.appendChild(dialog);
  dialog.showModal();
}

function authorizationHeader() {
  return `Bearer ${window.localStorage.accessToken}`;
}

async function fetchWebApi(endpoint, method, queryParamsObject) {
  const params = {
    headers: {
      Authorization: authorizationHeader()
    },
    method: method
  };
  // maybe a request body is needed for certain POSTs?
  /*if (body) {
    params.body = JSON.stringify(body);
  }*/
  const queryParamsString = new URLSearchParams(queryParamsObject).toString();

  return fetch(`https://api.spotify.com/v1/${endpoint}?${queryParamsString}`, params);
  /*const res = await fetch(`https://api.spotify.com/v1/${endpoint}?${queryParamsString}`, params);
  return await res.json();*/
}

/*async function fetchWebApiList(endpoint) {
  const results = [];
  const method = 'GET';
}*/

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

  try {
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: window.localStorage.clientid,
        grant_type: 'authorization_code',
        code,
        redirect_uri: window.location.origin + '/main.html',
        code_verifier: codeVerifier,
      }),
    };
    // TODO add error handling and logging here...?
    const body = await fetch('https://accounts.spotify.com/api/token', payload);
    const response = await body.json();
    console.log('got response for authorization code:', response);
    if (!response.access_token) {
      dialogError('no access token in response: <pre>' + JSON.stringify(response, null, 2));
      return;
    }
    window.localStorage.accessToken = response.access_token;
  } catch (error) {
    dialogError('got error while getting access token: ' + error);
    return;
  }

  log('access_token: ' + window.localStorage.accessToken);

  log('going to fetch /me to window.meResult...');
  window.meResult = await fetchWebApi('me', 'GET');

  log('going to fetch /me/playlists to window.mePlaylistsResult...');
  window.playlists = [];
  let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
  while (nextUrl) {
    const params = {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader()
      }
    };
    const response = await fetch(nextUrl, params);
    if (!response.ok) {
      dialogError('got bad response: ' + response.status);
      console.log('got bad response: ', response);
      return;
    }
    const json = await response.json();
    window.playlists = window.playlists.concat(json.items);
    nextUrl = json.next;
  }
})();

// TODO use snapshot_id to cache playlists: https://developer.spotify.com/documentation/web-api/concepts/rate-limits#:~:text=set%20of%20objects.-,Use%20the%20snapshot_id,-Playlist%20APIs%20expose
