const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');
const expiresIn = urlParams.get('expires_in');
// TODO use refresh stuff

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

  let playlists = [];
  let offset = 0;
  while (true) {
    const playlistsResponse = await api.getUserPlaylists(userId, {limit: 50, offset: offset});
    console.log('getUserPlaylists:', playlistsResponse);
    playlists = playlists.concat(playlistsResponse.body.items);
    offset += playlistsResponse.body.items.length;
    updateProgress(offset, playlistsResponse.body.total);
    if (!playlistsResponse.body.next)
      break;
  }

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

  const generate = document.createElement('div');
  document.body.appendChild(generate);
  renderGeneratePlaylists(generate);

  document.body.appendChild(document.createElement('br'));
  document.body.appendChild(document.createElement('br'));

  const playlists = document.createElement('div');
  document.body.appendChild(playlists);
  renderPlaylists(playlists);
})();

