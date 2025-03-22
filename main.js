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
    window.localStorage.removeItem('accessToken');
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

async function fetchWebApi(endpoint, method, queryParamsObject, fetchParams) {
  if (!fetchParams) {
    fetchParams = {};
  }
  if (!fetchParams.headers) {
    fetchParams.headers = {};
  }
  fetchParams.headers['Authorization'] = authorizationHeader();
  fetchParams.method = method;

  const queryParamsString = new URLSearchParams(queryParamsObject).toString();

  return fetch(`https://api.spotify.com/v1/${endpoint}?${queryParamsString}`, fetchParams);
}

function log(str) {
  console.log(str);
  const li = document.createElement('li');
  li.textContent = str;
  document.getElementById('log').appendChild(li);
}

async function downloadList(url) {
  let list = [];
  while (url) {
    log('fetching url: ' + url);
    const params = {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader()
      }
    };
    const response = await fetch(url, params);
    if (!response.ok) {
      // TODO handle rate limiting here
      dialogError('got bad response: ' + response.status);
      log('got bad response: ', response);
      return;
    }
    const json = await response.json();
    list = list.concat(json.items);
    url = json.next;
  }
  return list;
}

// Downloads playlists from spotify and stores them in idb
async function downloadPlaylists() {
  log('going to download playlists...');
  const playlists = await downloadList('https://api.spotify.com/v1/me/playlists?limit=50');
  await idbKeyval.set('playlists', playlists);
  await idbKeyval.set('playlists-timestamp', new Date().toString());
}

async function downloadLikedSongs() {
  log('going to fetch liked songs...');
  const likedSongs = await downloadList('https://api.spotify.com/v1/me/tracks?limit=50');
  await idbKeyval.set('likedsongs', likedSongs);
  await idbKeyval.set('likedsongs-timestamp', new Date().toString());
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

async function updateButtons() {
  const nameToPlaylist = new Map();
  const favorites = [];
  const playlists = await idbKeyval.get('playlists');
  if (!playlists) {
    return;
  }
  for (const playlist of playlists) {
    nameToPlaylist.set(playlist.name, playlist);
    if (playlist.name.endsWith(' (Favorites)')) {
      favorites.push(playlist.name);
    }
  }
  for (const targetName of favorites) {
    const sourceName = targetName.replace(' (Favorites)', '');
    const source = nameToPlaylist.get(sourceName);
    const target = nameToPlaylist.get(targetName);
    console.log(`${sourceName} => ${targetName} `, source, target);

    const div = document.createElement('div');
    const button = document.createElement('button');
    button.textContent = `${sourceName} => ${targetName}`;
    document.getElementById('buttons').appendChild(div);
    div.appendChild(button);
    button.addEventListener('click', async () => {
      log(`going to filter "${sourceName}" to "${targetName}"`);
      const sourceId = source.id;
      const targetId = target.id;
      const sourcePlaylistItems = await downloadList(`https://api.spotify.com/v1/playlists/${sourceId}/tracks?limit=50`);
      log('got sourcePlaylistItems. size: ' + sourcePlaylistItems.length);
      // TODO download target songs and figure out how to not mess with local songs
      //const targetSongs = await downloadList(`https://api.spotify.com/v1/playlists/${targetId}/tracks?limit=50`);
      //console.log('targetSongs: ', targetSongs);

      const likedSongs = await idbKeyval.get('likedsongs');
      const likedSongIds = new Set();
      for (const likedSong of likedSongs) {
        likedSongIds.add(likedSong.track.id);
      }

      const filteredTrackIds = [];
      for (const playlistItem of sourcePlaylistItems) {
        const trackId = playlistItem.track.id;
        if (likedSongIds.has(trackId)) {
          filteredTrackIds.push('spotify:track:' + trackId);
        }
      }

      log('filteredTrackIds.length: ' + filteredTrackIds.length);
      console.log('filteredTrackIds: ', filteredTrackIds);
      const body = JSON.stringify({
        uris: filteredTrackIds
      });
      await fetchWebApi(`playlists/${targetId}/tracks`, 'PUT', /*queryParams=*/{}, /*fetchParams=*/{body});
    });
  }
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
    likedSongsUpdate.setAttribute('disabled', '');
    playlistsUpdate.setAttribute('disabled', '');
    await downloadPlaylists();
    await updatePlaylistsText();
    await updateButtons();
    likedSongsUpdate.removeAttribute('disabled');
    playlistsUpdate.removeAttribute('disabled');
  });

  await updateLikedSongsText();
  likedSongsUpdate.addEventListener('click', async () => {
    likedSongsUpdate.setAttribute('disabled', '');
    playlistsUpdate.setAttribute('disabled', '');
    await downloadLikedSongs();
    await updateLikedSongsText();
    await updateButtons();
    likedSongsUpdate.removeAttribute('disabled');
    playlistsUpdate.removeAttribute('disabled');
  });

  // TODO handle refreshing access token better
  log('access token: ' + window.localStorage.accessToken);
  if (!window.localStorage.accessToken) {
    //log('code: ' + code);
    log('going to get access token...');
    if (await downloadAccessToken()) {
      log('failed to get access token. aborting.');
      return;
    }
    log('access token: ' + window.localStorage.accessToken);
  }

  if (!(await idbKeyval.get('playlists-timestamp'))) {
    await downloadPlaylists();
  }
  if (!(await idbKeyval.get('likedsongs-timestamp'))) {
    await downloadLikedSongs();
  }
  likedSongsUpdate.removeAttribute('disabled');
  playlistsUpdate.removeAttribute('disabled');
  await updateButtons();
})();
