const code = new URLSearchParams(window.location.search).get('code');
const playlistsNum = document.getElementById('playlistsnum');
const playlistsLastUpdated = document.getElementById('playlistslastupdated');
const playlistsUpdate = document.getElementById('playlistsupdate');
const likedSongsNum = document.getElementById('likedsongsnum');
const likedSongsLastUpdated = document.getElementById('likedsongslastupdated');
const likedSongsUpdate = document.getElementById('likedsongsupdate');

function dialogError(html) {
  const dialog = document.createElement('dialog');

  const restartButton = document.createElement('button');
  restartButton.textContent = 'log in again';
  dialog.appendChild(restartButton);
  restartButton.addEventListener('click', () => {
    window.location.href = '/';
  });

  const output = document.createElement('div');
  output.innerHTML = html;
  dialog.appendChild(output);

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
  document.getElementById('log').appendChild(div);
}

// Downloads playlists from spotify and stores them in idb
async function downloadPlaylists() {
  log('going to fetch /me/playlists to window.mePlaylistsResult...');
  let playlists = [];
  let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
  while (nextUrl) {
    log('fetching url: ' + nextUrl);
    const params = {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader()
      }
    };
    const response = await fetch(nextUrl, params);
    if (!response.ok) {
      // TODO handle rate limiting here
      dialogError('got bad response: ' + response.status);
      log('got bad response: ', response);
      return;
    }
    const json = await response.json();
    playlists = playlists.concat(json.items);
    nextUrl = json.next;
  }
  await idbKeyval.set('playlists', playlists);
  await idbKeyval.set('playlists-timestamp', new Date().toString());
}

// Sets access token to localStorage.accessToken. Returns true if there was an
// issue.
async function downloadAccessToken() {
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
        code_verifier: window.localStorage.codeVerifier,
      }),
    };
    const body = await fetch('https://accounts.spotify.com/api/token', payload);
    const response = await body.json();
    console.log('got response for authorization code:', response);
    if (!response.access_token) {
      dialogError('no access token in response: <pre>' + JSON.stringify(response, null, 2));
      return true;
    }
    window.localStorage.accessToken = response.access_token;
  } catch (error) {
    dialogError('got error while getting access token: ' + error);
    return true;
  }
  return false;
}

async function updatePlaylistsText() {
  const cachedPlaylists = await idbKeyval.get('playlists');
  const cachedPlaylistsTimestamp = await idbKeyval.get('playlists-timestamp');
  playlistsNum.textContent = cachedPlaylists ? cachedPlaylists.length : 'none';
  playlistsLastUpdated.textContent = cachedPlaylistsTimestamp ? cachedPlaylistsTimestamp : 'never';
}

async function updateLikedSongsText() {
  const cachedLikedSongs = await idbKeyval.get('likedsongs');
  const cachedLikedSongsTimestamp = await idbKeyval.get('likedsongs-timestamp');
  likedSongsNum.textContent = cachedLikedSongs ? cachedLikedSongs.length : 'none';
  likedSongsLastUpdated.textContent = cachedLikedSongsTimestamp ? cachedLikedSongsTimestamp : 'never';
}

(async () => {
  if (!code) {
    dialogError('code query parameter is missing');
    return;
  }

  if (!window.localStorage.codeVerifier) {
    dialogError('codeVerifier is missing from localStorage');
    return;
  }

  await updatePlaylistsText();
  playlistsUpdate.addEventListener('click', async () => {
    await downloadPlaylists();
    await updatePlaylistsText();
  });

  await updateLikedSongsText();
  likedSongsUpdate.addEventListener('click', async () => {
    await downloadLikedSongs();
    await updateLikedSongsText();
  });

  log('code: ' + code);
  log('going to get authorization code...');
  if (await downloadAccessToken()) {
    log('failed to get access token. aborting.');
    return;
  }
  log('access_token: ' + window.localStorage.accessToken);

  /*log('going to fetch /me to window.meResult...');
  window.meResult = await fetchWebApi('me', 'GET');*/
})();

// TODO use snapshot_id to cache playlists: https://developer.spotify.com/documentation/web-api/concepts/rate-limits#:~:text=set%20of%20objects.-,Use%20the%20snapshot_id,-Playlist%20APIs%20expose
