const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');
const expiresIn = urlParams.get('expires_in');
// TODO use refresh stuff

window.playlists = null;
window.playlistsUpdatedTimestamp = null; // TODO show this somewhere?
async function updatePlaylists(updateProgress) {
  window.playlists = [];
  let offset = 0;
  let playlistsResponse;
  do {
    playlistsResponse = await api.getUserPlaylists(userId, {limit: 50, offset: offset});
    console.log('getUserPlaylists:', playlistsResponse);
    playlists = playlists.concat(playlistsResponse.body.items);
    offset += playlistsResponse.body.items.length;
    if (updateProgress)
      updateProgress(offset, playlistsResponse.body.total);
  } while (playlistsResponse.body.next);
}
async function getPlaylists(updateProgress) {
  if (!window.playlists) {
    await updatePlaylists(updateProgress);
  }
  return window.playlists;
}
async function getPlaylistsById() {
  const playlists = await getPlaylists();
  const output = {};
  for (const playlist of playlists) {
    output[playlist.id] = playlist;
  }
  return output;
}
window.tracksByPlaylistId = {};
async function getTracksByPlaylistId(playlistId) {
  if (tracksByPlaylistId[playlistId])
    return tracksByPlaylistId[playlistId];

  let tracksResponse;
  let tracks = [];
  let offset = 0;
  do {
    console.log('getPlaylistTracks ' + playlistId + ' offset: ' + offset);
    tracksResponse = await api.getPlaylistTracks(playlistId, {
      limit: 50,
      offset: offset
    });
    console.log('tracksResponse:', tracksResponse);
    // TODO handle tracksResponse.body.items[i].is_local here??
    tracks = tracks.concat(tracksResponse.body.items.map(track => track.track));
    offset += tracksResponse.body.items.length;
  } while (tracksResponse.body.next);

  tracksByPlaylistId[playlistId] = tracks;
  return tracks;
}
window.savedTracks = null;
async function getSavedTracks() {
  if (window.savedTracks)
    return window.savedTracks;

  let tracks = [];
  let offset = 0;
  let mySavedTracksResponse;
  do {
    console.log('getMySavedTracks offset: ' + offset);
    mySavedTracksResponse = await api.getMySavedTracks({limit: 50, offset});
    tracks = tracks.concat(mySavedTracksResponse.body.items);
    offset += mySavedTracksResponse.body.items.length;
  } while (mySavedTracksResponse.body.next);

  window.savedTracks = tracks;
  return window.savedTracks;
}

async function renderPlaylists(main) {
  const loadButton = document.createElement('button');
  loadButton.textContent = 'load playlist id<->name table';
  main.appendChild(loadButton);
  await new Promise(resolve => loadButton.onclick = resolve);

  main.innerHTML = `<div>loading...</div>`;

  const progressDiv = document.createElement('div');
  main.appendChild(progressDiv);

  function updateProgress(numLoaded, numTotal) {
    if (!numTotal) {
      progressDiv.textContent = `${numLoaded} playlists loaded...`;
    } else {
      progressDiv.textContent = `${numLoaded}/${numTotal} playlists loaded...`;
    }
  }

  const playlists = await getPlaylists(updateProgress);

  main.innerHTML = '';

  const table = document.createElement('table');
  main.appendChild(table);
  table.innerHTML = `
    <thead><tr>
      <td>name</td>
      <td>num tracks</td>
      <td>id</td>
    </tr></thead>`;
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  for (const playlist of playlists) {
    const row = document.createElement('tr');
    tbody.appendChild(row);

    const name = document.createElement('td');
    name.textContent = playlist.name;
    row.appendChild(name);

    const numTracks = document.createElement('td');
    numTracks.textContent = playlist.tracks.total;
    row.appendChild(numTracks);

    const id = document.createElement('td');
    id.textContent = playlist.id;
    row.appendChild(id);
  }
}

async function renderCreateRecipe(main) {
  main.innerHTML = '';
  main.style = 'display: inline-block; border: solid black 1px;';

  const title = document.createElement('h3');
  title.textContent = 'Create Recipe';
  title.style = 'display: block';
  main.appendChild(title);

  const stepsList = document.createElement('ol');
  main.appendChild(stepsList);



  function addStep() {
    const li = document.createElement('li');
    stepsList.appendChild(li);
    li.textContent = 'step';
  }
}

async function renderRecipes(main) {
  const textarea = document.createElement('textarea');
  main.appendChild(textarea);

  main.appendChild(document.createElement('br'));

  const loadButton = document.createElement('button');
  loadButton.textContent = 'Load';
  loadButton.onclick = async () => {
    textarea.value = JSON.stringify(await loadRecipes(), null, 2);
  };
  main.appendChild(loadButton);

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.onclick = async () => {
    let json;
    try {
      json = JSON.parse(textarea.value);
    } catch (error) {
      console.log('error parsing user supplied json:', error);
      throw error;
    }
    // TODO should this be throttled/locked?
    console.log('calling saverecipes');
    await saveRecipes(json);
  };
  main.appendChild(saveButton);

  loadButton.click();

  const runButton = document.createElement('button');
  runButton.textContent = 'Run all';
  runButton.onclick = async () => {
    let recipes;
    try {
      recipes = JSON.parse(textarea.value);
    } catch (error) {
      console.log('user provided recipes fails JSON.parse:', error);
      return;
    }
    await executeRecipes(recipes.recipes);
  };
  main.appendChild(runButton);
}

async function executeRecipes(recipes) {
  const playlistsById = await getPlaylistsById();

  for (const recipe of recipes) {
    let tracks = [];
    for (const step of recipe.steps) {
      switch (step.operator) {
        case 'appendPlaylist':
          if (!step.operand || !step.operands[0]) {
            console.log('bad operands for appendPlaylist: ', recipe.operands);
          }
          const playlistId = step.operands[0];
          tracks = tracks.concat(await getTracksByPlaylistId(playlistId));
          break;

        case 'filterByLiked':
          const likedTrackIds = (await getSavedTracks()).map(track => track.track.id);
          const newTracks = [];
          for (const track of tracks) {
            if (likedTrackIds.includes(track.id)) {
              console.log('filter including track:', track);
              newTracks.push(track);
            } else {
              console.log('filter removing track:', track);
            }
          }
          tracks = newTracks;
          break;

        default:
          console.log('unrecognized operator: ' + recipe.operator);
          break;
      }
    }

    console.log('recipe done. tracks:', tracks);
    // apply tracks array to recipe.targetPlaylistId
    const trackUris = tracks.map(track => track.uri);
    const tracksPerRequest = 50;
    for (let i = 0; i < tracks.length; i += tracksPerRequest) {
      const rangeStart = 0;
      const insertBefore = 0;
      const response = await api.reorderTracksInPlaylist(recipe.targetPlaylistId, rangeStart, insertBefore, {
        uris: trackUris.slice(i, i + tracksPerRequest)
      });
      console.log('response:', response);
      break; // TODO delet this once this works
    }
  }
}

async function loadRecipes() {
  try {
    const response = await fetch('/recipes');
    const recipes = await response.json();
    /*console.log('loadRecipes /recipes response:\n'
      + `${response.status} ${response.statusText}\n\n${JSON.stringify(recipes, null, 2)}`);*/
    return recipes;
  } catch (error) {
    console.log('error loading recipes:', error);
    throw error;
  }
}

async function saveRecipes(recipes) {
  try {
    const response = await fetch('/recipes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(recipes)
    });

    const responseText = await response.text();
    console.log('saveRecipes /recipes response:\n'
      + `${response.status} ${response.statusText}\n\n${responseText}`);

  } catch (error) {
    console.log('saveRecipes fetch error:', error);
    throw error;
  }
}

function renderGeneratePlaylists(main) {
  main.innerHTML = '';

  const targetLabel = document.createElement('div');
  targetLabel.textContent = 'target playlist id:';
  main.appendChild(targetLabel);
  const targetInput = document.createElement('input');
  targetLabel.appendChild(targetInput);

  main.appendChild(document.createElement('br'));

  const filterByLikedLabel = document.createElement('div');
  main.appendChild(filterByLikedLabel);
  filterByLikedLabel.textContent = 'filter out unliked songs:';
  const filterByLikedCheckbox = document.createElement('input');
  filterByLikedCheckbox.type = 'checkbox';
  filterByLikedLabel.appendChild(filterByLikedCheckbox);

  main.appendChild(document.createElement('br'));

  const sources = document.createElement('div');
  main.appendChild(sources);
  sources.textContent = 'source playlist IDs:';

  const inputWrapper = document.createElement('div');
  inputWrapper.appendChild(document.createElement('input'));
  sources.appendChild(inputWrapper);

  const addSourceButtonWrapper = document.createElement('div');
  sources.appendChild(addSourceButtonWrapper);
  const addSourceButton = document.createElement('button');
  addSourceButton.textContent = 'add another source playlist';
  addSourceButtonWrapper.appendChild(addSourceButton);
  addSourceButton.onclick = () => {
    const sourceContainer = document.createElement('div');
    addSourceButton.insertAdjacentElement('beforebegin', sourceContainer);
    sourceContainer.appendChild(document.createElement('input'));
    const removeButton = document.createElement('button');
    sourceContainer.appendChild(removeButton);
    removeButton.textContent = 'remove';
    removeButton.onclick = () => {
      sourceContainer.remove();
    };
  };

  main.appendChild(document.createElement('br'));
  const submitButton = document.createElement('button');
  submitButton.textContent = 'generate playlist';
  submitButton.onclick = () => {
    const sourcePlaylistIds = [];
    for (const input of sources.querySelectorAll('input')) {
      sourcePlaylistIds.push(input.value);
    }
    generatePlaylists(sourcePlaylistIds, targetInput.value, filterByLikedCheckbox.checked);
  }
  main.appendChild(submitButton);
}

async function generatePlaylists(
    sourcePlaylistIds,
    targetPlaylistId,
    filterByLiked) {
  console.log('sourcePlaylistIds:', sourcePlaylistIds);
  console.log('targetPlaylistId:', targetPlaylistId);
  console.log('filterByLiked:', filterByLiked);

  const songs = [];
  for (const sourcePlaylistId in sourcePlaylistIds) {
    const playlistResponse = await api.getPlaylist(sourcePlaylistId);
    console.log('playlistResponse:', playlistResponse);
  }
}

(async () => {
  window.api = new window.SpotifyWebApi();
  api.setAccessToken(accessToken);
  const me = await api.getMe();
  console.log('me:', me);
  window.userId = me.body.id;

  /*const generate = document.createElement('div');
  document.body.appendChild(generate);
  renderGeneratePlaylists(generate);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('br'));*/

  const recipes = document.createElement('div');
  document.body.appendChild(recipes);
  renderRecipes(recipes);
  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('br'));

  const playlists = document.createElement('div');
  document.body.appendChild(playlists);
  renderPlaylists(playlists);
})();

